from fastapi import APIRouter, HTTPException
import redis
import json
from app.config import settings

router = APIRouter()

# Redis connection
def get_redis_client():
    try:
        client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            username=settings.REDIS_USERNAME,
            password=settings.REDIS_PASSWORD,
            decode_responses=True
        )
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis connection error: {str(e)}")

@router.get("/check")
def check_redis_data():
    """Check Redis database size"""
    try:
        client = get_redis_client()
        size = client.dbsize()
        return {"size": size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking Redis: {str(e)}")

@router.get("/data")
def get_redis_data():
    """Get data from Redis"""
    try:
        client = get_redis_client()
        key = "myArray"
        data = client.get(key)
        
        if data is None:
            return {"data": None, "message": "No data found"}
        
        # Try to parse as JSON
        try:
            parsed_data = json.loads(data)
            return {"data": parsed_data}
        except json.JSONDecodeError:
            return {"data": data}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data from Redis: {str(e)}")

@router.post("/data")
def set_redis_data(data: dict):
    """Set data in Redis"""
    try:
        client = get_redis_client()
        key = "myArray"
        json_data = json.dumps(data)
        client.set(key, json_data)
        return {"message": "Data saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving data to Redis: {str(e)}")

@router.delete("/data")
def clear_redis_data():
    """Clear all Redis data"""
    try:
        client = get_redis_client()
        client.flushdb()
        return {"message": "Redis data cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing Redis data: {str(e)}")
