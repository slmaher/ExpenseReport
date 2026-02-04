from fastapi import Form
from pydantic import BaseModel, UUID4
from datetime import datetime
import enum


class ExpenseStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    description: str | None = None
    file: str | None = None


def expense_create_mapper(title: str = Form(...), amount: float = Form(...), description: str | None = Form(None)) -> ExpenseCreate:
    return ExpenseCreate(title=title, amount=amount, description=description)


class ExpenseUpdate(BaseModel):
    title: str | None = None
    amount: float | None = None
    description: str | None = None
    file: str | None = None

    class Config:
        extra = "forbid"


def expense_update_mapper(title: str | None = Form(None), amount: float | None = Form(None), description: str | None = Form(None)) -> ExpenseUpdate:
    return ExpenseUpdate(title=title, amount=amount, description=description)


class ExpenseRetrieve(ExpenseCreate):
    id: int
    user_id: UUID4
    date: datetime
    status: ExpenseStatus = ExpenseStatus.PENDING
    admin_comment: str | None = None

    class Config:
        from_attributes = True


class ExpenseUpdateStatus(BaseModel):
    status: ExpenseStatus
    admin_comment: str | None = None

    class Config:
        extra = "forbid"
