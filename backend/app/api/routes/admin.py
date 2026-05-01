from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User, Teacher, Student, Booking, Payment, Feedback, UserRole
from app.schemas.schemas import UserOut, TeacherOut

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_stats(current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    total_teachers = db.query(Teacher).count()
    pending_teachers = db.query(Teacher).filter(Teacher.is_approved == False).count()
    total_bookings = db.query(Booking).count()
    total_revenue = db.query(func.sum(Payment.platform_fee)).filter(Payment.status == "VERIFIED").scalar() or 0
    total_payments = db.query(func.sum(Payment.amount)).filter(Payment.status == "VERIFIED").scalar() or 0
    pending_payments = db.query(Payment).filter(Payment.status == "PENDING").count()
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "pending_teachers": pending_teachers,
        "total_bookings": total_bookings,
        "total_revenue": round(total_revenue, 2),
        "total_payments": round(total_payments, 2),
        "pending_payments": pending_payments
    }

@router.get("/users", response_model=List[UserOut])
def list_users(current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role != UserRole.admin).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/block")
def block_user(user_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User blocked"}

@router.put("/users/{user_id}/unblock")
def unblock_user(user_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User unblocked"}

@router.get("/teachers/pending", response_model=List[TeacherOut])
def pending_teachers(current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.is_approved == False).all()

@router.put("/teachers/{teacher_id}/approve")
def approve_teacher(teacher_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.is_approved = True
    teacher.user.is_approved = True
    db.commit()
    return {"message": "Teacher approved"}

@router.put("/teachers/{teacher_id}/reject")
def reject_teacher(teacher_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    teacher.user.is_active = False
    db.commit()
    return {"message": "Teacher rejected"}
