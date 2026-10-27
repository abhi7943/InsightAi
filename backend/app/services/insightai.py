import io, json, re, uuid
import pandas as pd
import pdfplumber
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models import Dataset

RESERVED = {"select","from","where","drop","delete","insert","update","alter","create","grant","revoke","union","join","copy"}

def safe_identifier(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_]+", "_", value.strip().lower())
    value = re.sub(r"_+", "_", value).strip("_") or "dataset"
    if value[0].isdigit(): value = "d_" + value
    if value in RESERVED: value += "_data"
    return value[:50]

def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    out=df.copy()
    cols=[]; seen=set()
    for i,c in enumerate(out.columns):
        base=safe_identifier(str(c)) or f"column_{i+1}"
        name=base; n=2
        while name in seen:
            name=f"{base}_{n}"; n+=1
        seen.add(name); cols.append(name)
    out.columns=cols
    out=out.dropna(how="all")
    return out

def read_file(filename: str, content: bytes) -> pd.DataFrame:
    name=filename.lower()
    if name.endswith('.csv'):
        return pd.read_csv(io.BytesIO(content))
    if name.endswith('.xlsx'):
        return pd.read_excel(io.BytesIO(content), engine='openpyxl')
    if name.endswith('.xls'):
        return pd.read_excel(io.BytesIO(content), engine='xlrd')
    if name.endswith('.pdf'):
        rows=[]
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                table=page.extract_table()
                if table: rows.extend(table)
        if not rows: raise ValueError('No structured table was found in the PDF.')
        return pd.DataFrame(rows[1:], columns=rows[0])
    raise ValueError('Unsupported file format')

def pg_type(series: pd.Series) -> str:
    s=series.dropna()
    if s.empty: return 'TEXT'
    if pd.api.types.is_integer_dtype(s): return 'BIGINT'
    if pd.api.types.is_float_dtype(s): return 'DOUBLE PRECISION'
    if pd.api.types.is_bool_dtype(s): return 'BOOLEAN'
    if pd.api.types.is_datetime64_any_dtype(s): return 'TIMESTAMP'
    return 'TEXT'

def import_dataset(db: Session, company_id, filename: str, content: bytes) -> Dataset:
    df=clean_columns(read_file(filename, content))
    if df.empty: raise ValueError('The uploaded file contains no usable rows.')
    if len(df.columns)>80: raise ValueError('Maximum 80 columns per dataset.')
    dataset_id=uuid.uuid4()
    table_name=f"data_{str(company_id).replace('-','')[:12]}_{str(dataset_id).replace('-','')[:12]}"
    cols=[(c,pg_type(df[c])) for c in df.columns]
    definitions=', '.join(f'"{c}" {t}' for c,t in cols)
    db.execute(text(f'CREATE TABLE "{table_name}" ("row_id" BIGSERIAL PRIMARY KEY, {definitions})'))
    placeholders=', '.join(f':v{i}' for i in range(len(cols)))
    insert=text(f'INSERT INTO "{table_name}" ({", ".join(chr(34)+c+chr(34) for c,_ in cols)}) VALUES ({placeholders})')
    records=[]
    for row in df.itertuples(index=False, name=None):
        vals={f'v{i}': (None if pd.isna(v) else v.item() if hasattr(v,'item') else v) for i,v in enumerate(row)}
        records.append(vals)
    db.execute(insert, records)
    schema=[{'name':c,'type':t} for c,t in cols]
    ds=Dataset(id=dataset_id, company_id=company_id, name=filename.rsplit('.',1)[0][:255], source_filename=filename[:255], table_name=table_name, row_count=len(df), column_count=len(df.columns), schema_json=json.dumps(schema))
    db.add(ds); db.commit(); db.refresh(ds)
    return ds
