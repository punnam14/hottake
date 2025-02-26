from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os

# AWS RDS Database Credentials
DATABASE_URL = "mysql+pymysql://admin:Hottakes2025!@hottakes-db.cv1qdgnducne.us-east-1.rds.amazonaws.com/hottakes_db"

# SQLAlchemy Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# FastAPI App
app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Model
class HotTake(Base):
    __tablename__ = "hot_takes"
    
    id = Column(Integer, primary_key=True, index=True)
    hot_take = Column(String(500), nullable=False)
    name = Column(String(100), nullable=False)
    company = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Request Model for API
class HotTakeRequest(BaseModel):
    hot_take: str
    name: str
    company: str
    location: str

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI Backend!"}

@app.post("/submit-hot-take/")
def submit_hot_take(hot_take_request: HotTakeRequest, db: Session = Depends(get_db)):
    new_take = HotTake(
        hot_take=hot_take_request.hot_take,
        name=hot_take_request.name,
        company=hot_take_request.company,
        location=hot_take_request.location,
    )
    db.add(new_take)
    db.commit()
    db.refresh(new_take)
    return {"message": "Hot Take Submitted!", "data": new_take}

@app.get("/get-hot-takes/")
def get_hot_takes(db: Session = Depends(get_db)):
    hot_takes = db.query(HotTake).order_by(HotTake.id.desc()).limit(10).all() 
    return {"hot_takes": hot_takes}

