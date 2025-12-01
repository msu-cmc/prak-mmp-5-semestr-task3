from typing import Optional, List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, String, UniqueConstraint, DateTime, Float, Boolean, Text
from sqlalchemy.sql import func
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from src.database.database import Base


class Parameter(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )
    height: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )
    weight: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="parameter"
    )


class Type(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )
    name: Mapped[str] = mapped_column(
        String,
        unique=True
    )

    user_types: Mapped[list["UserType"]] = relationship(
        "UserType",
        back_populates="type"
    )


class User(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False
    )
    password: Mapped[str] = mapped_column(
        String,
        nullable=False
    )
    fio: Mapped[str] = mapped_column(
        String,
        nullable=False
    )
    role: Mapped[str] = mapped_column(
        String,
        nullable=False
    )
    gender: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )
    datetime: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    parameter_id: Mapped[int | None] = mapped_column(
        ForeignKey("parameters.id")
    )

    parameter: Mapped["Parameter"] = relationship(
        "Parameter",
        back_populates="users"
    )
    user_types: Mapped[list["UserType"]] = relationship(
        "UserType",
        back_populates="user"
    )
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        back_populates="user"
    )
    chats: Mapped[List["Chat"]] = relationship(
        "Chat",
        back_populates="user",
        passive_deletes=True,
    )


class ExerciseMuscle(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey(
            "exercises.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )
    muscle_id: Mapped[int] = mapped_column(
        ForeignKey(
            "muscles.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="exercise_muscle"
    )
    muscle: Mapped["Muscle"] = relationship(
        back_populates="exercise_muscle"
    )

    __table_args__ = (
        UniqueConstraint(
            "exercise_id",
            "muscle_id",
            name="uq_exercise_muscle_pair"
        ),
    )


class UserType(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )
    type_id: Mapped[int] = mapped_column(
        ForeignKey("types.id")
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="user_types"
    )
    type: Mapped["Type"] = relationship(
        "Type",
        back_populates="user_types"
    )


class Session(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    workout_id: Mapped[int | None] = mapped_column(
        ForeignKey("workouts.id", ondelete="SET NULL"),
        nullable=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    datetime_start: Mapped[DateTime] = mapped_column(
        DateTime,
        nullable=False
    )
    datetime_end: Mapped[DateTime] = mapped_column(
        DateTime,
        nullable=True
    )

    user: Mapped["User"] = relationship(
        back_populates="sessions"
    )
    workout: Mapped["Workout"] = relationship(
        back_populates="sessions"
    )
    sets: Mapped[list["Set"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class Workout(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        default=""
    )

    sessions: Mapped[list["Session"]] = relationship(
        back_populates="workout",
        passive_deletes=True
    )
    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="workout",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class WorkoutExercise(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    workout_id: Mapped[int] = mapped_column(
        ForeignKey("workouts.id", ondelete="CASCADE"),
        nullable=False
    )
    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False
    )

    workout: Mapped["Workout"] = relationship(
        back_populates="workout_exercises"
    )
    exercise: Mapped["Exercise"] = relationship(
        back_populates="workout_exercises"
    )

    __table_args__ = (
        UniqueConstraint(
            "workout_id",
            "exercise_id",
            name="uq_workout_exercise_pair"
        ),
    )


class Exercise(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )
    name_ru: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    sets: Mapped[list["Set"]] = relationship(
        "Set",
        back_populates="exercise",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    exercise_equipment: Mapped[list["ExerciseEquipment"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    exercise_muscle: Mapped[list["ExerciseMuscle"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
    )
    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class ExerciseEquipment(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey(
            "exercises.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )
    equipment_id: Mapped[int] = mapped_column(
        ForeignKey(
            "equipments.id",
            ondelete="CASCADE"
        ),
        nullable=False,
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="exercise_equipment"
    )
    equipment: Mapped["Equipment"] = relationship(
        back_populates="exercise_equipment"
    )

    __table_args__ = (
        UniqueConstraint(
            "exercise_id",
            "equipment_id",
            name="uq_exercise_equipment_pair"
        ),
    )


class Muscle(Base):
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    type: Mapped[str] = mapped_column(
        String(64),
        nullable=False
    )

    exercise_muscle: Mapped[list["ExerciseMuscle"]] = relationship(
        back_populates="muscle",
        cascade="all, delete-orphan",
    )


class Equipment(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    exercise_equipment: Mapped[list["ExerciseEquipment"]] = relationship(
        back_populates="equipment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Set(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=True)
    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False
    )
    session: Mapped["Session"] = relationship(back_populates="sets")
    exercise: Mapped["Exercise"] = relationship(
        "Exercise",
        back_populates="sets"
    )




class Chat(Base):
    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    llm_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="chats",
        lazy="joined",
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="chat",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Message.order.asc()",
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    chat_id: Mapped[UUID] = mapped_column(
        ForeignKey("chats.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_user: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )
    __table_args__ = (
        UniqueConstraint("chat_id", "order", name="uq_message_order_per_chat"),
    )

    chat: Mapped["Chat"] = relationship(
        "Chat",
        back_populates="messages",
        lazy="joined",
        passive_deletes=True,
    )