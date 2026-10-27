import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.session import Base, engine
from app.models import Company, User, Dataset, ChatMessage
from app.api import auth, datasets, dashboard


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insightai")


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="InsightAI API",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Global Error Handling
# ---------------------------------------------------------

@app.middleware("http")
async def request_error_middleware(request: Request, call_next):
    """
    Global error handler.

    Every request receives a small request ID so errors
    can be traced in the backend terminal.
    """

    request_id = str(uuid.uuid4())[:8]

    request.state.request_id = request_id

    try:
        response = await call_next(request)

        response.headers["X-Request-ID"] = request_id

        return response

    except SQLAlchemyError:
        logger.exception(
            "Database error [%s] %s %s",
            request_id,
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=503,
            content={
                "detail": (
                    "The database is temporarily unavailable. "
                    "Please try again."
                ),
                "request_id": request_id,
            },
            headers={
                "X-Request-ID": request_id,
            },
        )

    except Exception:
        logger.exception(
            "Unhandled server error [%s] %s %s",
            request_id,
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    "Something went wrong on the server. "
                    "Please try again."
                ),
                "request_id": request_id,
            },
            headers={
                "X-Request-ID": request_id,
            },
        )


# ---------------------------------------------------------
# Startup
# ---------------------------------------------------------

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "insightai-api",
    }


# ---------------------------------------------------------
# API Routes
# ---------------------------------------------------------

app.include_router(
    auth.router,
    prefix="/api",
)

app.include_router(
    datasets.router,
    prefix="/api",
)

app.include_router(
    dashboard.router,
    prefix="/api",
)