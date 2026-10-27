from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str

    access_token_expire_minutes: int = 60
    frontend_origin: str = "http://localhost:5173"
    max_upload_mb: int = 20

    google_api_key: str | None = None
    groq_api_key: str | None = None
    openai_api_key: str | None = None

    llm_model: str = "gemini/gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()

