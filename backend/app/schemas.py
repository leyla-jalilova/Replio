from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    # Что присылает сайт при регистрации (имя необязательно)
    name: str = Field(default="", max_length=100)
    email: str
    password: str = Field(min_length=6)


class UserOut(BaseModel):
    # Что сервер отвечает (без пароля!)
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str


class LoginData(BaseModel):
    # Что присылает сайт при входе
    email: str
    password: str


class Token(BaseModel):
    # Что сервер отвечает при успешном входе
    access_token: str
    token_type: str = "bearer"