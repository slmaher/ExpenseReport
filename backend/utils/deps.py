from fastapi import Depends
from sqlalchemy.orm import Session
from typing import Annotated
from .auth import get_current_user
from schema import CurrentUser
from database import get_db

current_user_dep = Annotated[CurrentUser, Depends(get_current_user)]
db_dep = Annotated[Session, Depends(get_db)]
