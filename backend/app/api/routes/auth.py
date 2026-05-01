from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User, Teacher, Student, UserRole
from app.schemas.schemas import UserCreate, TeacherCreate, LoginRequest, Token, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register/student", response_model=Token)
def register_student(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name, email=data.email,
        password=get_password_hash(data.password), role=UserRole.student
    )
    db.add(user)
    db.flush()
    student = Student(user_id=user.id)
    db.add(student)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, user_id=user.id, name=user.name)

@router.post("/register/teacher", response_model=Token)
def register_teacher(data: TeacherCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name, email=data.email,
        password=get_password_hash(data.password), role=UserRole.teacher,
        is_approved=False
    )
    db.add(user)
    db.flush()
    teacher = Teacher(
        user_id=user.id, subject=data.subject,
        level=data.level, hourly_rate=data.hourly_rate, bio=data.bio or ""
    )
    db.add(teacher)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, user_id=user.id, name=user.name)

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is blocked")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, user_id=user.id, name=user.name)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/register/admin", response_model=Token)
def register_admin(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name, email=data.email,
        password=get_password_hash(data.password), role=UserRole.admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, user_id=user.id, name=user.name)
