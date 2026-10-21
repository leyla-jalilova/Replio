from datetime import datetime

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    attempts: Mapped[list["Attempt"]] = relationship(back_populates="user")


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("scenarios.id"))
    score: Mapped[float]
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    user: Mapped["User"] = relationship(back_populates="attempts")
    scenario: Mapped["Scenario"] = relationship()


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    scenario_id: Mapped[int] = mapped_column(ForeignKey("scenarios.id"))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    scenario: Mapped["Scenario"] = relationship()
    messages: Mapped[list["Message"]] = relationship(
        back_populates="session", order_by="Message.id"
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"))
    role: Mapped[str] = mapped_column(String(20))  # "user" или "assistant"
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    session: Mapped["ChatSession"] = relationship(back_populates="messages")