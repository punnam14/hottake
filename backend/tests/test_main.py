from fastapi.testclient import TestClient
from main import app, get_db, Base, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=test_engine)

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI Backend!"}

def test_submit_hot_take():
    hot_take_data = {
        "hot_take": "React is overrated!",
        "name": "John Doe",
        "company": "Tech Corp",
        "location": "USA"
    }
    response = client.post("/submit-hot-take/", json=hot_take_data)
    assert response.status_code == 200
    assert "Hot Take Submitted!" in response.json()["message"]

def test_get_hot_takes():
    response = client.get("/get-hot-takes/")
    assert response.status_code == 200
    assert "hot_takes" in response.json()

def test_submit_feedback():
    feedback_data = {
        "name": "Jane Doe",
        "feedback_text": "Great website!"
    }
    response = client.post("/submit-feedback/", json=feedback_data)
    assert response.status_code == 200
    assert "Feedback Submitted!" in response.json()["message"]
