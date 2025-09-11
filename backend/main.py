from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from app.database import get_db, init_db
from app.routers import orders, reports, redis_routes
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

# Create FastAPI instance
app = FastAPI(
    title="SMILE Restaurant Management API",
    description="API for managing restaurant orders, reports and billing",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "https://smile-v3-fe.vercel.app",
        "https://smile-v3-fe-git-main-vietnh55s-projects.vercel.app",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(redis_routes.router, prefix="/api/redis", tags=["redis"])


@app.get("/")
async def root():
    return {"message": "SMILE Restaurant Management API"}

@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
