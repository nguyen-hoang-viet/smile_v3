# from sqlalchemy import create_engine, MetaData
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.pool import QueuePool
# from app.config import settings
# import os

# # Supabase client - only initialize if URL is provided
# supabase = None
# if settings.SUPABASE_URL and settings.SUPABASE_URL != "your_supabase_project_url":
#     try:
#         from supabase import create_client, Client
#         supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
#     except Exception as e:
#         print(f"Warning: Could not initialize Supabase client: {e}")
#         supabase = None

# # Database URL for PostgreSQL (Supabase)
# if settings.DB_HOST and settings.DB_HOST != "your_supabase_db_host" and settings.DB_PASSWORD:
#     DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
#     print(f"Using PostgreSQL database: {settings.DB_HOST}")
# else:
#     # Fallback to SQLite only if Supabase is not configured
#     DATABASE_URL = "sqlite:///./smile_restaurant.db"
#     print("Warning: Using SQLite database - Supabase not configured properly")

# # Create engine
# if DATABASE_URL.startswith("sqlite"):
#     # SQLite configuration
#     engine = create_engine(
#         DATABASE_URL,
#         connect_args={"check_same_thread": False}  # For SQLite
#     )
# else:
#     # PostgreSQL configuration
#     engine = create_engine(
#         DATABASE_URL,
#         poolclass=QueuePool,
#         pool_size=10,
#         max_overflow=20,
#         pool_pre_ping=True
#     )

# # Create SessionLocal class
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Create Base class
# Base = declarative_base()

# # Dependency to get DB session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # Initialize database
# async def init_db():
#     """Create database tables"""
#     Base.metadata.create_all(bind=engine)

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.config import settings
import os

# Supabase client - only initialize if URL is provided
supabase = None
if settings.SUPABASE_URL and settings.SUPABASE_URL != "https://jdzbcdhrwbxvesejjten.supabase.co":
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")
        supabase = None

# --- Database URL Configuration ---
# Đọc toàn bộ chuỗi kết nối database từ một biến môi trường duy nhất.
# Đây là phương pháp đáng tin cậy nhất, giúp tránh các lỗi khi tự kết hợp các thành phần.
# Chuỗi kết nối đầy đủ này nên được sao chép trực tiếp từ dashboard của Supabase.
DATABASE_URL = settings.DATABASE_URL

# Cung cấp một fallback an toàn về SQLite nếu biến DATABASE_URL không được thiết lập
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./smile_restaurant.db"
    print("Warning: Biến môi trường DATABASE_URL chưa được thiết lập. Đang sử dụng SQLite.")
else:
    print("Connecting to the database using the DATABASE_URL secret...")

# Create engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}  # For SQLite
    )
else:
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database
async def init_db():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)
