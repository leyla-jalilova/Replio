from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])

MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн",
          "июл", "авг", "сен", "окт", "ноя", "дек"]


def short_date(d: datetime) -> str:
    # 21 окт
    return f"{d.day} {MONTHS[d.month - 1]}"


def full_date(d: datetime) -> str:
    # 21 окт 2026
    return f"{d.day} {MONTHS[d.month - 1]} {d.year}"


def average(scores: list[float]) -> float:
    return round(sum(scores) / len(scores), 1) if scores else 0


@router.get("")
def get_progress(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Все попытки этого пользователя, от старых к новым
    attempts = (
        db.query(models.Attempt)
        .filter(models.Attempt.user_id == user.id)
        .order_by(models.Attempt.created_at)
        .all()
    )

    # Делим на «за последнюю неделю» и «раньше»
    week_ago = datetime.now() - timedelta(days=7)
    this_week = [a for a in attempts if a.created_at >= week_ago]
    earlier = [a for a in attempts if a.created_at < week_ago]

    if this_week and earlier:
        average_change = round(
            average([a.score for a in this_week]) - average([a.score for a in earlier]), 1
        )
    else:
        average_change = 0

    # Средний балл по каждому сценарию, чтобы найти слабые места
    by_scenario: dict[str, list[float]] = {}
    for a in attempts:
        by_scenario.setdefault(a.scenario.title, []).append(a.score)
    weak = [title for title, scores in by_scenario.items() if average(scores) < 7]
    attention = [title for title, scores in by_scenario.items() if average(scores) < 5]

    return {
        "stats": {
            "completedScenarios": len(attempts),
            "completedChange": len(this_week),
            "averageScore": average([a.score for a in attempts]),
            "averageChange": average_change,
            "weakPoints": len(weak),
            "weakPointsAttention": len(attention),
        },
        "chartData": [
            {"date": short_date(a.created_at), "score": a.score} for a in attempts
        ],
        "recentAttempts": [
            {"date": full_date(a.created_at), "scenario": a.scenario.title, "score": a.score}
            for a in reversed(attempts[-5:])
        ],
        "weakScenarios": weak,
    }