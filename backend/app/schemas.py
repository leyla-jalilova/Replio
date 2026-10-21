from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    # Что присылает сайт при регистрации
    email: str
    password: str = Field(min_length=6)


class UserOut(BaseModel):
    # Что сервер отвечает (без пароля!)
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str