from fastapi import UploadFile, BackgroundTasks
from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Session, relationship
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from database import Base
from schema import UserCreate, UserRetrieve, UserRole, UserUpdate
from utils import hash_password, verify_password
from exceptions import user_exists_exception, internal_server_exception, auth_failed_exception, user_not_found_exception
import uuid


class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # nullable if created with Google OAuth
    avatar = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)

    # Python relationships
    expense_reports = relationship("ExpenseReport", back_populates="user")

    # Class methods
    @classmethod
    def create_user(cls, db: Session, user: UserCreate, from_google: bool = False) -> UserRetrieve:

        new_user = User(is_active=True, role=UserRole.USER, **user.model_dump(exclude={"password"}, exclude_none=True, exclude_unset=True))

        if not from_google:
            new_user.hashed_password = hash_password(user.password)

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return UserRetrieve.model_validate(new_user)
        except IntegrityError:
            db.rollback()
            raise user_exists_exception
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception

    @classmethod
    def authenticate_user(cls, username: str, password: str, db: Session) -> UserRetrieve:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.hashed_password):
            raise auth_failed_exception

        db.refresh(user)
        return UserRetrieve.model_validate(user)

    @classmethod
    def get_all_users(cls, db: Session) -> list[UserRetrieve]:
        users = db.query(User).all()
        return [UserRetrieve.model_validate(user) for user in users]

    @classmethod
    def get_user(cls, user_id: UUID, db: Session) -> UserRetrieve | None:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            return UserRetrieve.model_validate(user)
        return None

    @classmethod
    def get_user_by_google_id(cls, google_id: str, db: Session) -> UserRetrieve | None:
        user = db.query(User).filter(User.google_id == google_id).first()
        if user:
            return UserRetrieve.model_validate(user)
        return None

    @classmethod
    def update_user_role(cls, db: Session, user_id: UUID, new_role: UserRole) -> UserRetrieve:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise user_not_found_exception

        user.role = new_role
        try:
            db.commit()
            db.refresh(user)
            return UserRetrieve.model_validate(user)
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception

    @classmethod
    async def update_user(
        cls,
        user_id: UUID,
        user_update: UserUpdate,
        avatar: UploadFile | None,
        db: Session,
        background_tasks: BackgroundTasks,
    ) -> UserRetrieve:
        from services.files_service import upload_file, delete_file_by_url

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise user_not_found_exception

        old_avatar = user.avatar

        if avatar:
            avatar_link = await upload_file(avatar, folder="avatars/")
            user.avatar = avatar_link

        to_update = user_update.model_dump(exclude_none=True, exclude_unset=True)
        for key, value in to_update.items():
            setattr(user, key, value)

        try:
            db.commit()
            db.refresh(user)

            if avatar and old_avatar:
                background_tasks.add_task(delete_file_by_url, old_avatar)

            return UserRetrieve.model_validate(user)
        except IntegrityError:
            db.rollback()
            raise user_exists_exception
        except SQLAlchemyError:
            db.rollback()
            raise internal_server_exception
