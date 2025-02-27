from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://admin:password@mysql-db:3306/hottakes_db")
OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in .env file")
if not OPENCAGE_API_KEY:
    raise ValueError("OPENCAGE_API_KEY is not set in .env file")

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

class FeedbackRequest(BaseModel):
    name: str
    feedback_text: str

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI Backend!"}

@app.post("/submit-hot-take/")
def submit_hot_take(hot_take_request: HotTakeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    new_take = HotTake(
        hot_take=hot_take_request.hot_take,
        name=hot_take_request.name,
        company=hot_take_request.company,
        location=hot_take_request.location,
        latitude=None,
        longitude=None,
    )
    db.add(new_take)
    db.commit()
    db.refresh(new_take)
    background_tasks.add_task(fetch_and_update_coordinates, new_take.id, new_take.location)
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

def fetch_and_update_coordinates(hot_take_id: int, location: str):
    """Fetch latitude & longitude and update the database."""
    session = SessionLocal()
    try:
        geocode_url = f"https://api.opencagedata.com/geocode/v1/json?q={location}&key={OPENCAGE_API_KEY}"
        response = requests.get(geocode_url)
        if response.status_code != 200:
            print(f"Failed to fetch location coordinates for {location}")
            return
        data = response.json()
        if not data["results"]:
            print(f"No valid coordinates found for {location}")
            return
        lat = data["results"][0]["geometry"]["lat"]
        lng = data["results"][0]["geometry"]["lng"]
        hot_take = session.query(HotTake).filter(HotTake.id == hot_take_id).first()
        if hot_take:
            hot_take.latitude = lat
            hot_take.longitude = lng
            session.commit()
            print(f"Updated {location} with lat={lat}, lng={lng}")
    except Exception as e:
        print(f"Error updating coordinates: {e}")
    finally:
        session.close()
