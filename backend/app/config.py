from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "sqlite:///./sukhad_journey.db"
    secret_key: str = "dev-secret-key"
    access_token_expire_minutes: int = 60
    otp_expire_seconds: int = 300
    sms_provider_api_key: str = ""
    emergency_helpline_number: str = "112"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
