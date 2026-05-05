from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/tutorconnect"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "uploads"
    PLATFORM_COMMISSION: float = 0.30
    ADMIN_UPI_ID: str = "tutorconnect@upi"

    class Config:
        env_file = ".env"

settings = Settings()
