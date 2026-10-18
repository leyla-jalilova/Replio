from fastapi import APIRouter

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("")
def get_progress():
    # Пока тестовые данные. Потом будем брать их из базы данных.
    return {
        "stats": {
            "completedScenarios": 12,
            "completedChange": 3,
            "averageScore": 7.6,
            "averageChange": 0.4,
            "weakPoints": 2,
            "weakPointsAttention": 1,
        },
        "chartData": [
            {"date": "1 апр", "score": 4},
            {"date": "8 апр", "score": 6.5},
            {"date": "15 апр", "score": 7.2},
            {"date": "22 апр", "score": 8.5},
        ],
        "recentAttempts": [
            {"date": "12 апр 2025", "scenario": "Обратная связь", "score": 7},
            {"date": "8 апр 2025", "scenario": "Конфликт", "score": 8},
            {"date": "29 мар 2025", "scenario": "Демотивация", "score": 6},
        ],
    }