from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import Teacher, User, AvailabilitySlot, Booking, BookingStatus, Notification
from app.schemas.schemas import TeacherOut, TeacherUpdate, SlotCreate, SlotOut, BookingOut

router = APIRouter(prefix="/api/teachers", tags=["teachers"])

@router.get("/", response_model=List[TeacherOut])
def list_teachers(subject: Optional[str] = None, level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.is_approved == True)
    if subject:
        query = query.filter(Teacher.subject.ilike(f"%{subject}%"))
    if level:
        query = query.filter(Teacher.level == level)
    return query.all()

@router.get("/me", response_model=TeacherOut)
def get_my_profile(current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher

@router.put("/me", response_model=TeacherOut)
def update_profile(data: TeacherUpdate, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    for k, v in data.dict(exclude_none=True).items():
        setattr(teacher, k, v)
    db.commit()
    db.refresh(teacher)
    return teacher

@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.post("/slots", response_model=SlotOut)
def add_slot(data: SlotCreate, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    slot = AvailabilitySlot(teacher_id=teacher.id, start_time=data.start_time, end_time=data.end_time)
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot

@router.get("/slots/my", response_model=List[SlotOut])
def get_my_slots(current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    return db.query(AvailabilitySlot).filter(AvailabilitySlot.teacher_id == teacher.id).all()

@router.get("/{teacher_id}/slots", response_model=List[SlotOut])
def get_teacher_slots(teacher_id: int, db: Session = Depends(get_db)):
    return db.query(AvailabilitySlot).filter(
        AvailabilitySlot.teacher_id == teacher_id,
        AvailabilitySlot.is_booked == False
    ).all()

@router.delete("/slots/{slot_id}")
def delete_slot(slot_id: int, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    slot = db.query(AvailabilitySlot).filter(AvailabilitySlot.id == slot_id, AvailabilitySlot.teacher_id == teacher.id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted"}

@router.get("/bookings/incoming", response_model=List[BookingOut])
def get_incoming_bookings(current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    return db.query(Booking).options(joinedload(Booking.student)).filter(
        Booking.teacher_id == teacher.id
    ).order_by(Booking.created_at.desc()).all()

@router.put("/bookings/{booking_id}/accept")
def accept_booking(booking_id: int, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.teacher_id == teacher.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.teacher_accepted
    notif = Notification(user_id=booking.student.user_id, message=f"Your booking request has been accepted! Please proceed with payment.")
    db.add(notif)
    db.commit()
    return {"message": "Booking accepted"}

@router.put("/bookings/{booking_id}/reject")
def reject_booking(booking_id: int, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.teacher_id == teacher.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.teacher_rejected
    notif = Notification(user_id=booking.student.user_id, message=f"Your booking request was declined by the teacher.")
    db.add(notif)
    db.commit()
    return {"message": "Booking rejected"}

@router.put("/bookings/{booking_id}/complete")
def complete_booking(booking_id: int, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.teacher_id == teacher.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus.completed
    db.commit()
    return {"message": "Session marked as completed"}
