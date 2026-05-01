from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class TeachingLevel(str, Enum):
    primary = "Primary"
    middle = "Middle"
    higher = "Higher"

class BookingStatus(str, Enum):
    requested = "REQUESTED"
    teacher_accepted = "TEACHER_ACCEPTED"
    teacher_rejected = "TEACHER_REJECTED"
    payment_pending = "PAYMENT_PENDING"
    pending_verification = "PENDING_VERIFICATION"
    confirmed = "CONFIRMED"
    completed = "COMPLETED"
    cancelled = "CANCELLED"

class PaymentStatus(str, Enum):
    pending = "PENDING"
    verified = "VERIFIED"
    rejected = "REJECTED"

# Auth
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class TeacherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    subject: str
    level: TeachingLevel
    hourly_rate: float
    bio: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Teacher
class TeacherOut(BaseModel):
    id: int
    user_id: int
    subject: str
    level: str
    hourly_rate: float
    bio: str
    is_approved: bool
    total_earnings: float
    user: UserOut
    class Config:
        from_attributes = True

class TeacherUpdate(BaseModel):
    subject: Optional[str] = None
    level: Optional[TeachingLevel] = None
    hourly_rate: Optional[float] = None
    bio: Optional[str] = None

# Course
class CourseCreate(BaseModel):
    title: str
    subject: str
    level: TeachingLevel
    description: str
    price: float = 0.0

class CourseOut(BaseModel):
    id: int
    teacher_id: int
    title: str
    subject: str
    level: str
    description: str
    price: float
    is_active: bool
    created_at: datetime
    teacher: Optional[TeacherOut] = None
    class Config:
        from_attributes = True

# Availability
class SlotCreate(BaseModel):
    start_time: datetime
    end_time: datetime

class SlotOut(BaseModel):
    id: int
    teacher_id: int
    start_time: datetime
    end_time: datetime
    is_booked: bool
    class Config:
        from_attributes = True

# Booking
class BookingCreate(BaseModel):
    teacher_id: int
    time_slot: datetime
    duration: int = 1
    notes: Optional[str] = ""

class BookingOut(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    time_slot: datetime
    duration: int
    status: str
    notes: str
    total_amount: float
    created_at: datetime
    teacher: Optional[TeacherOut] = None
    class Config:
        from_attributes = True

# Payment
class PaymentCreate(BaseModel):
    booking_id: int
    transaction_id: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    booking_id: int
    student_id: int
    teacher_id: int
    amount: float
    platform_fee: float
    teacher_earning: float
    payment_method: str
    transaction_id: Optional[str]
    screenshot_url: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Feedback
class FeedbackCreate(BaseModel):
    booking_id: int
    teacher_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = ""

class FeedbackOut(BaseModel):
    id: int
    student_id: int
    teacher_id: int
    booking_id: int
    rating: int
    comment: str
    created_at: datetime
    class Config:
        from_attributes = True

# Notification
class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True
