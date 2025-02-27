from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os

DATABASE_URL = "mysql+pymysql://admin:Hottakes2025!@hottakes-db.cv1qdgnducne.us-east-1.rds.amazonaws.com/hottakes_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    feedback_text = Column(String(1000), nullable=False)

class HotTake(Base):
    __tablename__ = "hot_takes"
    
    id = Column(Integer, primary_key=True, index=True)
    hot_take = Column(String(500), nullable=False)
    name = Column(String(100), nullable=False)
    company = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)  
    longitude = Column(Float, nullable=True)  

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class HotTakeRequest(BaseModel):
    hot_take: str
    name: str
    company: str
    location: str
    latitude: float
    longitude: float

class FeedbackRequest(BaseModel):
    name: str
    feedback_text: str

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
        latitude=hot_take_request.latitude,
        longitude=hot_take_request.longitude,
    )
    db.add(new_take)
    db.commit()
    db.refresh(new_take)
    return {"message": "Hot Take Submitted!", "data": new_take}

@app.get("/get-hot-takes/")
def get_hot_takes(db: Session = Depends(get_db)):
    location_counts = (
        db.query(HotTake.location, func.count(HotTake.id).label("count"))
        .group_by(HotTake.location)
        .all()
    )
    location_counts_dict = {loc: count for loc, count in location_counts}

    hot_takes = db.query(HotTake).order_by(HotTake.id.desc()).limit(10).all()

    hot_takes_with_count = [
        {
            "id": take.id,
            "hot_take": take.hot_take,
            "name": take.name,
            "company": take.company,
            "location": take.location,
            "latitude": take.latitude,
            "longitude": take.longitude,
            "count": location_counts_dict.get(take.location, 1)  
        }
        for take in hot_takes
    ]

    return {"hot_takes": hot_takes_with_count}

@app.post("/submit-feedback/")
def submit_feedback(feedback_request: FeedbackRequest, db: Session = Depends(get_db)):
    new_feedback = Feedback(
        name=feedback_request.name,
        feedback_text=feedback_request.feedback_text,
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"message": "Feedback Submitted!", "data": new_feedback}
