import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import Payment, Booking, Student, Teacher, User, BookingStatus, PaymentStatus, Notification
from app.schemas.schemas import PaymentOut
from app.core.config import settings

router = APIRouter(prefix="/api/payments", tags=["payments"])

UPLOAD_DIR = settings.UPLOAD_DIR
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/initiate")
def initiate_payment(
    booking_id: int = Form(...),
    transaction_id: Optional[str] = Form(None),
    screenshot: UploadFile = File(...),
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.student_id == student.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.teacher_accepted:
        raise HTTPException(status_code=400, detail="Booking must be accepted by teacher first")

    # Save screenshot
    ext = screenshot.filename.split(".")[-1]
    filename = f"payment_{booking_id}_{datetime.utcnow().timestamp()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(screenshot.file, f)

    commission = booking.total_amount * settings.PLATFORM_COMMISSION
    teacher_earning = booking.total_amount - commission

    payment = Payment(
        booking_id=booking_id,
        student_id=student.id,
        teacher_id=booking.teacher_id,
        amount=booking.total_amount,
        platform_fee=commission,
        teacher_earning=teacher_earning,
        payment_method="QR",
        transaction_id=transaction_id,
        screenshot_url=f"/uploads/{filename}",
        status=PaymentStatus.pending
    )
    db.add(payment)
    booking.status = BookingStatus.pending_verification
    db.commit()
    return {"message": "Payment submitted for verification", "payment_id": payment.id}

@router.get("/my", response_model=List[PaymentOut])
def my_payments(current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    return db.query(Payment).filter(Payment.student_id == student.id).order_by(Payment.created_at.desc()).all()

@router.get("/", response_model=List[PaymentOut])
def all_payments(current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()

@router.put("/{payment_id}/verify")
def verify_payment(payment_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = PaymentStatus.verified
    payment.verified_at = datetime.utcnow()
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    booking.status = BookingStatus.confirmed
    teacher = db.query(Teacher).filter(Teacher.id == payment.teacher_id).first()
    teacher.total_earnings += payment.teacher_earning
    notif = Notification(user_id=booking.student.user_id, message="Payment verified! Your session is confirmed.")
    db.add(notif)
    db.commit()
    return {"message": "Payment verified, booking confirmed"}

@router.put("/{payment_id}/reject")
def reject_payment(payment_id: int, current_user: User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = PaymentStatus.rejected
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    booking.status = BookingStatus.payment_pending
    notif = Notification(user_id=booking.student.user_id, message="Payment rejected. Please re-upload your payment proof.")
    db.add(notif)
    db.commit()
    return {"message": "Payment rejected"}

@router.get("/upi-info")
def get_upi_info():
    return {"upi_id": settings.ADMIN_UPI_ID, "qr_url": "/static/qr.png"}
