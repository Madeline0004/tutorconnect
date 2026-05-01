from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import Feedback, Student, Booking, User, BookingStatus
from app.schemas.schemas import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

@router.post("/", response_model=FeedbackOut)
def submit_feedback(data: FeedbackCreate, current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking or booking.status != BookingStatus.completed:
        raise HTTPException(status_code=400, detail="Can only submit feedback for completed sessions")
    existing = db.query(Feedback).filter(Feedback.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted")
    fb = Feedback(
        student_id=student.id,
        teacher_id=data.teacher_id,
        booking_id=data.booking_id,
        rating=data.rating,
        comment=data.comment or ""
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/teacher/{teacher_id}", response_model=List[FeedbackOut])
def teacher_feedback(teacher_id: int, db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.teacher_id == teacher_id).order_by(Feedback.created_at.desc()).all()
