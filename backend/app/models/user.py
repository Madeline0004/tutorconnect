from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class TeachingLevel(str, enum.Enum):
    primary = "Primary"
    middle = "Middle"
    higher = "Higher"

class BookingStatus(str, enum.Enum):
    requested = "REQUESTED"
    teacher_accepted = "TEACHER_ACCEPTED"
    teacher_rejected = "TEACHER_REJECTED"
    payment_pending = "PAYMENT_PENDING"
    pending_verification = "PENDING_VERIFICATION"
    confirmed = "CONFIRMED"
    completed = "COMPLETED"
    cancelled = "CANCELLED"

class PaymentStatus(str, enum.Enum):
    pending = "PENDING"
    verified = "VERIFIED"
    rejected = "REJECTED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)

class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    subject = Column(String(100), nullable=False)
    level = Column(Enum(TeachingLevel), nullable=False)
    hourly_rate = Column(Float, nullable=False)
    bio = Column(Text, default="")
    is_approved = Column(Boolean, default=False)
    total_earnings = Column(Float, default=0.0)

    user = relationship("User", back_populates="teacher_profile")
    courses = relationship("Course", back_populates="teacher")
    bookings = relationship("Booking", back_populates="teacher", foreign_keys="Booking.teacher_id")
    feedback_received = relationship("Feedback", back_populates="teacher")
    availability_slots = relationship("AvailabilitySlot", back_populates="teacher")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("Enrollment", back_populates="student")
    bookings = relationship("Booking", back_populates="student", foreign_keys="Booking.student_id")
    feedback_given = relationship("Feedback", back_populates="student")
    payments = relationship("Payment", back_populates="student", foreign_keys="Payment.student_id")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    title = Column(String(200), nullable=False)
    subject = Column(String(100), nullable=False)
    level = Column(Enum(TeachingLevel), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    teacher = relationship("Teacher", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    is_booked = Column(Boolean, default=False)

    teacher = relationship("Teacher", back_populates="availability_slots")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    slot_id = Column(Integer, ForeignKey("availability_slots.id"), nullable=True)
    time_slot = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Integer, default=1)
    status = Column(Enum(BookingStatus), default=BookingStatus.requested)
    notes = Column(Text, default="")
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("Student", back_populates="bookings", foreign_keys=[student_id])
    teacher = relationship("Teacher", back_populates="bookings", foreign_keys=[teacher_id])
    payment = relationship("Payment", back_populates="booking", uselist=False)
    feedback = relationship("Feedback", back_populates="booking", uselist=False)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    teacher_earning = Column(Float, nullable=False)
    payment_method = Column(String(50), default="QR")
    transaction_id = Column(String(200), nullable=True)
    screenshot_url = Column(String(500), nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)

    booking = relationship("Booking", back_populates="payment")
    student = relationship("Student", back_populates="payments", foreign_keys=[student_id])

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="feedback_given")
    teacher = relationship("Teacher", back_populates="feedback_received")
    booking = relationship("Booking", back_populates="feedback")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
