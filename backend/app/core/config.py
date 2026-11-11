from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ApexRide API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    MYSQL_ROOT_PASSWORD: str = "apexride_root_secret_2026"
    MYSQL_DATABASE: str = "apexride_db"
    MYSQL_USER: str = "apexride_user"
    MYSQL_PASSWORD: str = "apexride_password_secure"
    DATABASE_URL: str = "mysql+aiomysql://apexride_user:apexride_password_secure@db:3306/apexride_db"

    # Security & Auth
    SECRET_KEY: str = "9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost,http://localhost:3000,http://apexride.seu-dominio.com"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # Uploads
    UPLOAD_DIR: str = "/app/static/uploads"
    
    # Cloudflare Tunnel
    TUNNEL_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
