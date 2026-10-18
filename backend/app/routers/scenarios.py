from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.get("")
def list_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(models.Scenario).all()
    return [
        {"id": s.id, "title": s.title, "description": s.description}
        for s in scenarios
    ]