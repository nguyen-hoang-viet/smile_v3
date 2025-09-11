import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Supabase settings
    SUPABASE_URL: str = "https://jdzbcdhrwbxvesejjten.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkemJjZGhyd2J4dmVzZWpqdGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODc4ODIsImV4cCI6MjA0ODQ2Mzg4Mn0.z5_uf1LdOBLp-xd8c6nN0SfgSLgPM_xP7T6F7KxteFw"
    
    # Database settings (PostgreSQL via Supabase)
    DB_HOST: str = "aws-1-ap-southeast-1.pooler.supabase.com"
    DB_USER: str = "postgres.jdzbcdhrwbxvesejjten"
    DB_PASSWORD: str = "Hoangviet1905/"
    DB_NAME: str = "postgres"
    DB_PORT: int = 6543
    DATABASE_URL: str = "postgresql://postgres.jdzbcdhrwbxvesejjten:Hoangviet1905/@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_USERNAME: Optional[str] = None
    REDIS_PASSWORD: Optional[str] = None
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
