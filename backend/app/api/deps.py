from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.core.security import decode_subject
from app.models import User


security = HTTPBearer()


def db_dep():
    yield from get_db()


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(db_dep),
) -> User:

    token = credentials.credentials

    try:
        user_id = decode_subject(token)
        user = db.get(User, UUID(user_id))

    except (ValueError, TypeError):
        user = None

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or has expired. Please sign in again.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return user