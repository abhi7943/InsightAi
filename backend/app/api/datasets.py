from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from app.api.deps import current_user, db_dep
from app.models import User, Dataset, ChatMessage
from app.schemas.datasets import DatasetOut, ChatRequest, ChatResponse
from app.services.ingestion import import_dataset
from app.services.ai import run_question, summarize, build_chart
from app.services.report import build_pdf
import pandas as pd
from io import BytesIO

router=APIRouter(prefix='/datasets',tags=['datasets'])

@router.get('',response_model=list[DatasetOut])
def list_datasets(user:User=Depends(current_user),db:Session=Depends(db_dep)):
    return list(db.scalars(select(Dataset).where(Dataset.company_id==user.company_id).order_by(Dataset.created_at.desc())))

@router.post('/upload',response_model=DatasetOut)
async def upload(file:UploadFile=File(...),user:User=Depends(current_user),db:Session=Depends(db_dep)):
    if not file.filename or not file.filename.lower().endswith(('.csv','.xlsx','.xls','.pdf')): raise HTTPException(400,'Supported files: CSV, XLSX, XLS, PDF')
    content=await file.read()
    from app.core.config import settings
    if len(content)>settings.max_upload_mb*1024*1024: raise HTTPException(413,'File is too large')
    try: return import_dataset(db,user.company_id,file.filename,content)
    except Exception as e: db.rollback(); raise HTTPException(400,f'Could not import file: {e}')

@router.delete('/{dataset_id}')
def delete_dataset(dataset_id:str,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    d=db.scalar(select(Dataset).where(Dataset.id==dataset_id,Dataset.company_id==user.company_id))
    if not d: raise HTTPException(404,'Dataset not found')
    db.execute(text(f'DROP TABLE IF EXISTS "{d.table_name}"')); db.delete(d); db.commit(); return {'ok':True}

@router.post('/chat',response_model=ChatResponse)
def chat(req:ChatRequest,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    datasets=list(db.scalars(select(Dataset).where(Dataset.company_id==user.company_id)))
    if not datasets: raise HTTPException(400,'Upload a dataset first')
    try:
        sql,cols,rows=run_question(db=db,question=req.question,datasets=datasets,history=req.history)
        answer=summarize(question=req.question,columns=cols,rows=rows,history=req.history)
        chart=build_chart(cols,rows)
    except Exception as e: raise HTTPException(400,str(e))
    db.add(ChatMessage(company_id=user.company_id,user_id=user.id,question=req.question,answer=answer,sql_query=sql)); db.commit()
    return ChatResponse(answer=answer,sql=sql,columns=cols,rows=rows,chart=chart)

@router.get('/{dataset_id}/download.csv')
def download_csv(dataset_id:str,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    d=db.scalar(select(Dataset).where(Dataset.id==dataset_id,Dataset.company_id==user.company_id))
    if not d: raise HTTPException(404,'Dataset not found')
    df=pd.read_sql(text(f'SELECT * FROM "{d.table_name}"'),db.connection())
    return Response(df.to_csv(index=False),media_type='text/csv',headers={'Content-Disposition':f'attachment; filename="{d.source_filename.rsplit(".",1)[0]}.csv"'})

@router.get('/{dataset_id}/download.xlsx')
def download_xlsx(dataset_id:str,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    d=db.scalar(select(Dataset).where(Dataset.id==dataset_id,Dataset.company_id==user.company_id))
    if not d: raise HTTPException(404,'Dataset not found')
    df=pd.read_sql(text(f'SELECT * FROM "{d.table_name}"'),db.connection()); buf=BytesIO(); df.to_excel(buf,index=False,engine='openpyxl'); buf.seek(0)
    return Response(buf.getvalue(),media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',headers={'Content-Disposition':f'attachment; filename="{d.source_filename.rsplit(".",1)[0]}.xlsx"'})

@router.post('/report')
def report(req:ChatRequest,user:User=Depends(current_user),db:Session=Depends(db_dep)):
    datasets=list(db.scalars(select(Dataset).where(Dataset.company_id==user.company_id)))
    try:
        sql,cols,rows=run_question(db,req.question,datasets,req.history); answer=summarize(req.question,cols,rows,req.history); pdf=build_pdf('InsightAI Business Report',answer,cols,rows)
    except Exception as e: raise HTTPException(400,str(e))
    return Response(pdf,media_type='application/pdf',headers={'Content-Disposition':'attachment; filename="insightai-report.pdf"'})
