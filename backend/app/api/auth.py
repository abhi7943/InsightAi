from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import db_dep, current_user
from app.models import User, Company
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token

router=APIRouter(prefix='/auth', tags=['auth'])

def user_out(u): return UserOut(id=u.id,full_name=u.full_name,email=u.email,role=u.role,company_id=u.company_id,company_name=u.company.name)

@router.post('/register', response_model=TokenResponse)
def register(data:RegisterRequest, db:Session=Depends(db_dep)):
    if db.scalar(select(User).where(User.email==data.email.lower())): raise HTTPException(409,'Email already registered')
    company=Company(name=data.company_name.strip()); db.add(company); db.flush()
    user=User(company_id=company.id,full_name=data.full_name.strip(),email=data.email.lower(),password_hash=hash_password(data.password)); db.add(user); db.commit(); db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)),user=user_out(user))

@router.post('/login', response_model=TokenResponse)
def login(data:LoginRequest, db:Session=Depends(db_dep)):
    user=db.scalar(select(User).where(User.email==data.email.lower()))
    if not user or not verify_password(data.password,user.password_hash): raise HTTPException(401,'Invalid email or password')
    return TokenResponse(access_token=create_access_token(str(user.id)),user=user_out(user))

@router.get('/me',response_model=UserOut)
def me(user:User=Depends(current_user)): return user_out(user)
