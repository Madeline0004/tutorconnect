"""
Seed script to create demo users for TutorConnect.
Run: python seed.py  (from the backend directory, with venv activated)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User, Teacher, Student, UserRole, TeachingLevel
from app.core.security import get_password_hash

def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@tc.com").first():
            print("✅ Demo data already exists!")
            print("\nDemo Accounts:")
            print("  Admin:   admin@tc.com    / admin123")
            print("  Teacher: teacher@tc.com  / teacher123")
            print("  Student: student@tc.com  / student123")
            return

        print("🌱 Seeding demo data...")

        # Admin
        admin = User(name="Admin User", email="admin@tc.com",
                     password=get_password_hash("admin123"), role=UserRole.admin)
        db.add(admin)

        # Teacher 1
        t1_user = User(name="Dr. Ananya Sharma", email="teacher@tc.com",
                       password=get_password_hash("teacher123"), role=UserRole.teacher, is_approved=True)
        db.add(t1_user)
        db.flush()
        teacher1 = Teacher(user_id=t1_user.id, subject="Mathematics", level=TeachingLevel.higher,
                           hourly_rate=500, bio="10 years of experience teaching advanced mathematics. PhD from IIT Delhi.", is_approved=True)
        db.add(teacher1)

        # Teacher 2
        t2_user = User(name="Prof. Rajan Mehta", email="teacher2@tc.com",
                       password=get_password_hash("teacher123"), role=UserRole.teacher, is_approved=True)
        db.add(t2_user)
        db.flush()
        teacher2 = Teacher(user_id=t2_user.id, subject="Physics", level=TeachingLevel.higher,
                           hourly_rate=600, bio="IIT Bombay graduate. Specializes in JEE preparation and conceptual Physics.", is_approved=True)
        db.add(teacher2)

        # Teacher 3 (pending)
        t3_user = User(name="Ms. Priya Patel", email="teacher3@tc.com",
                       password=get_password_hash("teacher123"), role=UserRole.teacher, is_approved=False)
        db.add(t3_user)
        db.flush()
        teacher3 = Teacher(user_id=t3_user.id, subject="English", level=TeachingLevel.middle,
                           hourly_rate=350, bio="English literature graduate with 5 years of teaching experience.", is_approved=False)
        db.add(teacher3)

        # Student
        s1_user = User(name="Rahul Kumar", email="student@tc.com",
                       password=get_password_hash("student123"), role=UserRole.student)
        db.add(s1_user)
        db.flush()
        student1 = Student(user_id=s1_user.id)
        db.add(student1)

        # Student 2
        s2_user = User(name="Sneha Gupta", email="student2@tc.com",
                       password=get_password_hash("student123"), role=UserRole.student)
        db.add(s2_user)
        db.flush()
        student2 = Student(user_id=s2_user.id)
        db.add(student2)

        db.commit()

        # Add courses (need to flush to get teacher IDs)
        from app.models.user import Course
        db.refresh(teacher1)
        db.refresh(teacher2)

        courses = [
            Course(teacher_id=teacher1.id, title="Advanced Calculus & Differential Equations",
                   subject="Mathematics", level=TeachingLevel.higher,
                   description="Master calculus from limits to multivariable. Perfect for JEE Advanced prep.", price=2999),
            Course(teacher_id=teacher1.id, title="Class 10 Mathematics Complete Course",
                   subject="Mathematics", level=TeachingLevel.middle,
                   description="Complete CBSE Class 10 Maths covering all chapters with practice tests.", price=1499),
            Course(teacher_id=teacher2.id, title="JEE Physics Masterclass",
                   subject="Physics", level=TeachingLevel.higher,
                   description="Complete JEE Physics preparation with problem-solving strategies.", price=3499),
            Course(teacher_id=teacher2.id, title="Class 9-10 Physics Foundation",
                   subject="Physics", level=TeachingLevel.middle,
                   description="Build strong Physics fundamentals for board exams.", price=1999),
        ]
        for course in courses:
            db.add(course)
        db.commit()

        print("✅ Demo data seeded successfully!\n")
        print("Demo Accounts:")
        print("  Admin:    admin@tc.com    / admin123")
        print("  Teacher:  teacher@tc.com  / teacher123")
        print("  Teacher2: teacher2@tc.com / teacher123")
        print("  Student:  student@tc.com  / student123")
        print("  Student2: student2@tc.com / student123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
