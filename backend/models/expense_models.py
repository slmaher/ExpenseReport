from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, extract, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import BackgroundTasks
from typing import Self
from database import Base
from schema import ExpenseCreate, ExpenseRetrieve, ExpenseUpdate, ExpenseStatus
from datetime import datetime
from exceptions import invalid_expense_status_exception, internal_server_exception, bad_expense_access_exception, invalid_expense_update_exception


class ExpenseReport(Base):
    __tablename__ = 'expense_reports'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(ExpenseStatus), nullable=False, default=ExpenseStatus.PENDING)

    admin_comment = Column(String, nullable=True)
    description = Column(String, nullable=True)
    file = Column(String, nullable=True)

    # Python relationships
    user = relationship("User", back_populates="expense_reports")

    @classmethod
    def create(cls, db: Session, expense_create: ExpenseCreate, user_id: UUID, date: datetime, status: str) -> ExpenseRetrieve:
        if status not in ["Pending", "Approved", "Rejected"]:
            raise invalid_expense_status_exception

        expense_report = cls(**expense_create.model_dump(), user_id=user_id, date=date, status=status)

        try:
            db.add(expense_report)
            db.commit()
            db.refresh(expense_report)
            return ExpenseRetrieve.model_validate(expense_report)
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception

    @classmethod
    def get_user_expenses(cls, db: Session, user_id: UUID) -> list[ExpenseRetrieve]:
        try:
            expenses = db.query(cls).filter(cls.user_id == user_id).all()
            return [ExpenseRetrieve.model_validate(expense) for expense in expenses]
        except SQLAlchemyError:
            raise internal_server_exception

    @classmethod
    def update_user_expense(cls, expense: Self, db: Session, expense_update: ExpenseUpdate) -> ExpenseRetrieve:
        try:
            if expense.status != "Pending":
                raise invalid_expense_update_exception

            to_update = expense_update.model_dump(exclude_none=True, exclude_unset=True)
            for key, value in to_update.items():
                setattr(expense, key, value)

            db.commit()
            db.refresh(expense)
            return ExpenseRetrieve.model_validate(expense)
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception

    @classmethod
    def check_user_expense_update_auth(cls, db: Session, user_id: UUID, expense_id: int) -> Self:
        try:
            expense = db.query(cls).filter(cls.user_id == user_id, cls.id == expense_id).first()
            if not expense:
                raise bad_expense_access_exception
            if expense.status != ExpenseStatus.PENDING:
                raise invalid_expense_update_exception
            return expense
        except SQLAlchemyError:
            raise internal_server_exception

    @classmethod
    def delete_user_expense(cls, db: Session, user_id: UUID, expense_id: int, background_tasks: BackgroundTasks) -> None:
        from services.files_service import delete_file_by_url

        try:
            expense = db.query(cls).filter(cls.user_id == user_id, cls.id == expense_id).first()
            if not expense:
                raise bad_expense_access_exception

            if expense.status != "Pending":
                raise invalid_expense_update_exception

            if expense.file:
                background_tasks.add_task(delete_file_by_url, expense.file)

            db.delete(expense)
            db.commit()
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception

    @classmethod
    def get_all_expenses(cls, db: Session, user: UUID, month: int) -> list[ExpenseRetrieve]:
        try:
            q = db.query(cls)
            if user is not None:
                q = q.filter(cls.user_id == user)

            if month > 0:
                q = q.filter(extract("month", cls.date) == month)

            expenses = q.all()

            return [ExpenseRetrieve.model_validate(expense) for expense in expenses]
        except SQLAlchemyError:
            raise internal_server_exception

    @classmethod
    def update_expense_status(cls, db: Session, expense_id: int, status: str, admin_comment: str | None) -> ExpenseRetrieve:
        if status not in ["Pending", "Approved", "Rejected"]:
            raise invalid_expense_status_exception

        try:
            expense = db.query(cls).filter(cls.id == expense_id).first()
            if not expense:
                raise bad_expense_access_exception

            expense.status = status

            if admin_comment is not None:
                expense.admin_comment = admin_comment

            db.commit()
            db.refresh(expense)
            return ExpenseRetrieve.model_validate(expense)
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception
