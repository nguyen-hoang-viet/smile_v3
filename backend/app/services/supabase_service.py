from typing import List, Optional
from supabase import Client
from app.database import supabase
from app.schemas.schemas import OrderCreate, ReportCreate
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self, client: Client):
        self.client = client
    
    # Order operations
    async def get_all_orders(self) -> List[dict]:
        """Get all orders using Supabase client"""
        try:
            result = self.client.table("order_list").select("*").order("dish_name").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching orders: {e}")
            raise
    
    async def get_orders_by_table(self, table_id: int) -> List[dict]:
        """Get orders by table ID using Supabase client"""
        try:
            result = self.client.table("order_list").select("*").eq("table_id", table_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching orders for table {table_id}: {e}")
            raise
    
    async def create_order(self, order_data: dict) -> dict:
        """Create order using Supabase client"""
        try:
            result = self.client.table("order_list").insert(order_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            raise
    
    async def delete_all_orders(self) -> bool:
        """Delete all orders using Supabase client"""
        try:
            # Supabase requires a condition for delete, so we use a condition that matches all
            result = self.client.table("order_list").delete().neq("id", -1).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting all orders: {e}")
            raise
    
    # Report operations
    async def get_all_reports(self) -> List[dict]:
        """Get all reports using Supabase client"""
        try:
            result = self.client.table("report").select("*").order("created_at", desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching reports: {e}")
            raise
    
    async def create_report(self, report_data: dict) -> dict:
        """Create report using Supabase client"""
        try:
            result = self.client.table("report").insert(report_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating report: {e}")
            raise
    
    async def delete_all_reports(self) -> bool:
        """Delete all reports using Supabase client"""
        try:
            result = self.client.table("report").delete().neq("id", -1).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting all reports: {e}")
            raise

# Global service instance
supabase_service = SupabaseService(supabase)
