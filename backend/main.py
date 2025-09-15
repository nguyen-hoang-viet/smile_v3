# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging, os

from app.database import get_db, init_db
from app.routers import orders, reports
# redis_routes đôi khi làm crash nếu thiếu env/redis -> import tùy chọn
try:
    from app.routers import redis_routes
    HAS_REDIS = True
except Exception as e:
    logging.exception("Redis routes disabled: %s", e)
    HAS_REDIS = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cho phép server khởi động ngay cả khi DB lỗi
    try:
        await init_db()
    except Exception as e:
        logging.exception("init_db failed, server still starts: %s", e)
    yield

app = FastAPI(
    title="SMILE Restaurant Management API",
    description="API for managing restaurant orders, reports and billing",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://smile-v3-fe.vercel.app",
        "https://smile-v3-fe-git-main-vietnh55s-projects.vercel.app",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
if HAS_REDIS:
    app.include_router(redis_routes.router, prefix="/api/redis", tags=["redis"])

@app.get("/")
async def root():
    return {"message": "SMILE Restaurant Management API"}  # liveness

@app.get("/api/health")
async def health_check():
    return {"status": "ok"} # health check

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "7860")),
        reload=False,
        proxy_headers=True,
        forwarded_allow_ips="*"
    )
