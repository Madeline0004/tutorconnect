from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.database import engine, Base
from app.models.user import *  # Import all models
from app.api.routes import auth, teachers, courses, bookings, payments, feedback, admin, notifications

# Create tables
Base.metadata.create_all(bind=engine)

# Create upload directory
os.makedirs("uploads", exist_ok=True)
os.makedirs("static", exist_ok=True)

app = FastAPI(title="TutorConnect API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(teachers.router)
app.include_router(courses.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(feedback.router)
app.include_router(admin.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {"message": "TutorConnect API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
