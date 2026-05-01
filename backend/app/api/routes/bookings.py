from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import Booking, Student, Teacher, User, BookingStatus, Notification
from app.schemas.schemas import BookingCreate, BookingOut
from app.core.config import settings

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("/", response_model=BookingOut)
def create_booking(data: BookingCreate, current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    teacher = db.query(Teacher).filter(Teacher.id == data.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    total = teacher.hourly_rate * data.duration
    booking = Booking(
        student_id=student.id,
        teacher_id=data.teacher_id,
        time_slot=data.time_slot,
        duration=data.duration,
        notes=data.notes or "",
        total_amount=total,
        status=BookingStatus.requested
    )
    db.add(booking)
    db.flush()
    notif = Notification(user_id=teacher.user_id, message=f"New booking request from {current_user.name} for {data.duration}hr session.")
    db.add(notif)
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/my", response_model=List[BookingOut])
def my_bookings(current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    return db.query(Booking).options(joinedload(Booking.teacher).joinedload(Teacher.user)).filter(
        Booking.student_id == student.id
    ).order_by(Booking.created_at.desc()).all()

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).options(joinedload(Booking.teacher).joinedload(Teacher.user)).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.get("/", response_model=List[BookingOut])
def all_bookings(current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return db.query(Booking).options(
        joinedload(Booking.teacher).joinedload(Teacher.user),
        joinedload(Booking.student).joinedload(Student.user)
    ).order_by(Booking.created_at.desc()).all()
