from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Report
from app.schemas.schemas import ReportResponse, ReportCreate, AddReportRequest

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
def get_all_reports(db: Session = Depends(get_db)):
    """Get all reports"""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports

@router.get("/table/{table_id}", response_model=List[ReportResponse])
def get_reports_by_table(table_id: int, db: Session = Depends(get_db)):
    """Get reports by table ID"""
    reports = db.query(Report).filter(Report.table_id == table_id).all()
    return reports

@router.post("/", response_model=ReportResponse)
def create_report(report_request: AddReportRequest, db: Session = Depends(get_db)):
    """Create a new report entry"""
    report_data = ReportCreate(
        table_id=report_request.tableNumber,
        date=report_request.date,
        hour=report_request.time,
        product_code=report_request.code,
        product_name=report_request.nameDish,
        quantity=report_request.quantity,
        total=report_request.totalCheck,
        ship_fee=report_request.shipFee,
        discount=report_request.discountCheck
    )
    
    db_report = Report(**report_data.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.delete("/")
def delete_all_reports(db: Session = Depends(get_db)):
    """Delete all reports (TRUNCATE equivalent)"""
    try:
        db.query(Report).delete()
        db.commit()
        return {"message": "All reports deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting reports: {str(e)}")

@router.delete("/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    """Delete a specific report"""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
