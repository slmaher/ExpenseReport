from fastapi import APIRouter, Depends, status, UploadFile, File, BackgroundTasks
from typing import Annotated
from datetime import datetime
from models import ExpenseReport
from schema import ExpenseCreate, ExpenseRetrieve, ExpenseUpdate, expense_create_mapper, expense_update_mapper
from services.files_service import upload_file, delete_file_by_url
from utils import current_user_dep, db_dep

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ExpenseRetrieve)
async def create_expense_report(
        expense: Annotated[ExpenseCreate, Depends(expense_create_mapper)],
        db: db_dep,
        current_user: current_user_dep,
        file: UploadFile | None = File(None),
):

    if file:
        upload_link = await upload_file(file, folder="expense-reports/")
        expense.file = upload_link

    new_expense = ExpenseReport.create(db, expense, current_user.id, datetime.now(), "Pending")

    return new_expense


@router.get("", response_model=list[ExpenseRetrieve], status_code=status.HTTP_200_OK)
def get_my_expense_reports(db: db_dep, current_user: current_user_dep):
    my_expenses = ExpenseReport.get_user_expenses(db, current_user.id)

    return my_expenses


@router.put("/{expense_id}", response_model=ExpenseRetrieve, status_code=status.HTTP_200_OK)
async def update_expense_report(
        expense_id: int,
        expense_update: Annotated[ExpenseUpdate, Depends(expense_update_mapper)],
        db: db_dep,
        current_user: current_user_dep,
        background_tasks: BackgroundTasks,
        file: UploadFile | None = File(None),
):
    expense = ExpenseReport.check_user_expense_update_auth(db, current_user.id, expense_id)
    old_file = expense.file
    if file:
        upload_link = await upload_file(file, folder="expense-reports/")
        expense_update.file = upload_link

    updated_expense = ExpenseReport.update_user_expense(expense, db, expense_update)

    # Background task to delete the old file. It is ran only after the request is sent to user (but same process).
    if file and old_file:
        background_tasks.add_task(delete_file_by_url, old_file)

    return updated_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_expense_report(
    expense_id: int,
    db: db_dep,
    current_user: current_user_dep,
    background_tasks: BackgroundTasks,
):
    ExpenseReport.delete_user_expense(db, current_user.id, expense_id, background_tasks)
