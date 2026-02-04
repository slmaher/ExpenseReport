from fastapi import Form
from pydantic import BaseModel, EmailStr, UUID4
from .auth_schemas import Token
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class UserSignup(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    first_name: str | None = None  # None if created via Google OAuth
    last_name: str | None = None  # None if created via Google OAuth
    username: str
    email: EmailStr
    password: str | None = None  # None if created via Google OAuth
    avatar: str | None = None
    google_id: str | None = None  # None if created via Google OAuth


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None

    class Config:
        extra = "forbid"


def user_update_mapper(
        first_name: str | None = Form(None),
        last_name: str | None = Form(None),
        username: str | None = Form(None),
        email: EmailStr | None = Form(None),
) -> UserUpdate:
    return UserUpdate(first_name=first_name, last_name=last_name, username=username, email=email)


class UserRetrieve(BaseModel):
    id: UUID4
    first_name: str | None = None
    last_name: str | None = None
    username: str
    email: EmailStr
    google_id: str | None = None
    avatar: str | None = None
    role: UserRole = UserRole.USER

    class Config:
        from_attributes = True


class CurrentUser(BaseModel):
    id: UUID4
    username: str
    role: UserRole


class LoginResponse(Token):
    user: UserRetrieve
