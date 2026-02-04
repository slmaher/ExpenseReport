from fastapi import APIRouter, Query, status
from typing import Annotated
from models import ExpenseReport
from schema import ExpenseRetrieve, ExpenseUpdateStatus, UserRetrieve, UserRole
from models import User
from utils import db_dep, current_user_dep
from uuid import UUID
from exceptions import change_own_role_exception

router = APIRouter()


@router.get("/reports", response_model=list[ExpenseRetrieve], status_code=status.HTTP_200_OK)
def get_all_expense_reports(
        db: db_dep,
        user_id: UUID | None = Query(None),
        month: Annotated[int, Query(ge=0, le=12)] = 0,
):
    all_expenses = ExpenseReport.get_all_expenses(db, user=user_id, month=month)
    return all_expenses


@router.put("/reports/{expense_id}/status", response_model=ExpenseRetrieve, status_code=status.HTTP_200_OK)
def update_expense_report_status(
    expense_id: int,
    details: ExpenseUpdateStatus,
    db: db_dep,
):
    """Status must be one of 'Pending', 'Approved', or 'Rejected'."""
    updated_expense = ExpenseReport.update_expense_status(db, expense_id=expense_id, status=details.status, admin_comment=details.admin_comment)
    return updated_expense


@router.get("/users", response_model=list[UserRetrieve], status_code=status.HTTP_200_OK)
def get_all_users(db: db_dep):
    all_users = User.get_all_users(db)
    return all_users


@router.patch("/users/{user_id}", response_model=UserRetrieve, status_code=status.HTTP_200_OK)
def update_user_role(
    user_id: UUID,
    new_role: UserRole,
    db: db_dep,
    current_user: current_user_dep,
):
    if current_user.id == user_id:
        raise change_own_role_exception

    updated_user = User.update_user_role(db, user_id=user_id, new_role=new_role)
    return updated_user
