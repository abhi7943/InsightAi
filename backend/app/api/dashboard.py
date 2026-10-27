from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from app.api.deps import current_user, db_dep
from app.models import User, Dataset
from app.services.ai import generate_business_insights
import json

router=APIRouter(prefix='/dashboard',tags=['dashboard'])

def pick_column(columns, keywords):
    for col in columns:
        low=col.lower()
        for key in keywords:
            if key in low: return col
    return None

def qcol(col):
    return '"'+col.replace('"','""')+'"'

def numeric_expr(col):
    c=qcol(col)
    return f"CASE WHEN {c}::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN {c}::numeric ELSE 0 END"

def rows_as_dict(result):
    return [dict(r._mapping) for r in result.fetchall()]

@router.get('/summary')
def summary(user:User=Depends(current_user),db:Session=Depends(db_dep)):
    datasets=list(db.scalars(select(Dataset).where(Dataset.company_id==user.company_id).order_by(Dataset.created_at.desc())))
    total_rows=sum(d.row_count for d in datasets)
    return {'datasets':len(datasets),'rows':total_rows,'columns':sum(d.column_count for d in datasets),'latest_dataset':datasets[0].name if datasets else None}

@router.get('/dataset/{dataset_id}/preview')
def preview(dataset_id:str,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    d=db.scalar(select(Dataset).where(Dataset.id==dataset_id,Dataset.company_id==user.company_id))
    if not d: return {'columns':[],'rows':[]}
    r=db.execute(text(f'SELECT * FROM "{d.table_name}" LIMIT 20'))
    return {'columns':list(r.keys()),'rows':[list(x) for x in r.fetchall()]}

@router.get('/dataset/{dataset_id}/insights')
def dataset_insights(dataset_id:str,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    d=db.scalar(select(Dataset).where(Dataset.id==dataset_id,Dataset.company_id==user.company_id))
    if not d: raise HTTPException(404,'Dataset not found')
    schema=json.loads(d.schema_json)
    columns=[x['name'] for x in schema]
    table='"'+d.table_name.replace('"','""')+'"'
    revenue_col=pick_column(columns,['revenue','sales','amount','total','price'])
    quantity_col=pick_column(columns,['quantity','qty','units','volume'])
    product_col=pick_column(columns,['product','item','sku'])
    customer_col=pick_column(columns,['customer','client','buyer'])
    category_col=pick_column(columns,['category','type','segment'])
    date_col=pick_column(columns,['date','time','day','month'])

    total_revenue=0.0
    total_quantity=0.0
    if revenue_col:
        row=db.execute(text(f'SELECT COALESCE(SUM({numeric_expr(revenue_col)}),0) AS value FROM {table}')).first()
        total_revenue=float(row.value or 0)
    if quantity_col:
        row=db.execute(text(f'SELECT COALESCE(SUM({numeric_expr(quantity_col)}),0) AS value FROM {table}')).first()
        total_quantity=float(row.value or 0)

    revenue_by_product=[]; quantity_by_product=[]; top_customers=[]; revenue_by_date=[]
    top_product=None; top_quantity_product=None; top_customer=None; best_day=None; top_category=None

    if product_col and revenue_col:
        q=text(f'''SELECT {qcol(product_col)} AS product, COALESCE(SUM({numeric_expr(revenue_col)}),0) AS revenue FROM {table} WHERE {qcol(product_col)} IS NOT NULL GROUP BY {qcol(product_col)} ORDER BY revenue DESC LIMIT 10''')
        revenue_by_product=[{'product':str(r['product']),'revenue':float(r['revenue'] or 0)} for r in rows_as_dict(db.execute(q))]
        if revenue_by_product: top_product=revenue_by_product[0]
    if product_col and quantity_col:
        q=text(f'''SELECT {qcol(product_col)} AS product, COALESCE(SUM({numeric_expr(quantity_col)}),0) AS quantity FROM {table} WHERE {qcol(product_col)} IS NOT NULL GROUP BY {qcol(product_col)} ORDER BY quantity DESC LIMIT 10''')
        quantity_by_product=[{'product':str(r['product']),'quantity':float(r['quantity'] or 0)} for r in rows_as_dict(db.execute(q))]
        if quantity_by_product: top_quantity_product=quantity_by_product[0]
    if customer_col and quantity_col:
        q=text(f'''SELECT {qcol(customer_col)} AS customer, COALESCE(SUM({numeric_expr(quantity_col)}),0) AS quantity FROM {table} WHERE {qcol(customer_col)} IS NOT NULL GROUP BY {qcol(customer_col)} ORDER BY quantity DESC LIMIT 5''')
        top_customers=[{'customer':str(r['customer']),'quantity':float(r['quantity'] or 0)} for r in rows_as_dict(db.execute(q))]
        if top_customers: top_customer=top_customers[0]
    if date_col and revenue_col:
        q=text(f'''SELECT {qcol(date_col)} AS date, COALESCE(SUM({numeric_expr(revenue_col)}),0) AS revenue FROM {table} WHERE {qcol(date_col)} IS NOT NULL GROUP BY {qcol(date_col)} ORDER BY {qcol(date_col)} LIMIT 30''')
        revenue_by_date=[{'date':str(r['date']),'revenue':float(r['revenue'] or 0)} for r in rows_as_dict(db.execute(q))]
        if revenue_by_date: best_day=max(revenue_by_date,key=lambda x:x['revenue'])
    if category_col and revenue_col:
        q=text(f'''SELECT {qcol(category_col)} AS category, COALESCE(SUM({numeric_expr(revenue_col)}),0) AS revenue FROM {table} WHERE {qcol(category_col)} IS NOT NULL GROUP BY {qcol(category_col)} ORDER BY revenue DESC LIMIT 1''')
        r=db.execute(q).first()
        if r: top_category={'category':str(r.category),'revenue':float(r.revenue or 0)}

    analytics_data={
        'dataset_name':d.name,'rows':d.row_count,'columns':d.column_count,
        'total_revenue':round(total_revenue,2),'total_quantity':round(total_quantity,2),
        'top_product':top_product,'top_quantity_product':top_quantity_product,
        'top_customer':top_customer,'best_day':best_day,'top_category':top_category,
        'charts':{'revenue_by_product':revenue_by_product,'quantity_by_product':quantity_by_product,'revenue_by_date':revenue_by_date,'top_customers':top_customers},
    }
    try: ai_insights=generate_business_insights(analytics_data)
    except Exception as e: ai_insights={'summary':'AI insights are currently unavailable.','key_insights':[],'recommendations':[],'opportunities':[],'risks':[],'error':str(e)}
    return {'analytics':analytics_data,'insights':ai_insights}
