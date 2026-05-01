from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import Course, Teacher, Student, Enrollment, User
from app.schemas.schemas import CourseCreate, CourseOut

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/", response_model=List[CourseOut])
def list_courses(subject: Optional[str] = None, level: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Course).options(joinedload(Course.teacher).joinedload(Teacher.user)).filter(Course.is_active == True)
    if subject:
        query = query.filter(Course.subject.ilike(f"%{subject}%"))
    if level:
        query = query.filter(Course.level == level)
    return query.all()

@router.post("/", response_model=CourseOut)
def create_course(data: CourseCreate, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    course = Course(teacher_id=teacher.id, **data.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/my", response_model=List[CourseOut])
def my_courses(current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    return db.query(Course).options(joinedload(Course.teacher).joinedload(Teacher.user)).filter(Course.teacher_id == teacher.id).all()

@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).options(joinedload(Course.teacher).joinedload(Teacher.user)).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseOut)
def update_course(course_id: int, data: CourseCreate, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == teacher.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for k, v in data.dict().items():
        setattr(course, k, v)
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}")
def delete_course(course_id: int, current_user: User = Depends(require_role("teacher")), db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    course = db.query(Course).filter(Course.id == course_id, Course.teacher_id == teacher.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_active = False
    db.commit()
    return {"message": "Course deleted"}

@router.post("/{course_id}/enroll")
def enroll_course(course_id: int, current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    existing = db.query(Enrollment).filter(Enrollment.student_id == student.id, Enrollment.course_id == course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = Enrollment(student_id=student.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled successfully"}

@router.get("/enrolled/my", response_model=List[CourseOut])
def my_enrolled_courses(current_user: User = Depends(require_role("student")), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    course_ids = [e.course_id for e in enrollments]
    return db.query(Course).options(joinedload(Course.teacher).joinedload(Teacher.user)).filter(Course.id.in_(course_ids)).all()
