from fastapi import APIRouter, Depends, Response, Cookie, status, UploadFile, File, BackgroundTasks, Request
from typing import Annotated
from models import User
import os
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from utils import create_access_token, create_refresh_token, db_dep, current_user_dep, decode_refresh_token, oauth
from schema import UserCreate, CurrentUser, LoginResponse, UserRetrieve, UserUpdate, UserSignup, user_update_mapper
from exceptions import invalid_token_exception

router = APIRouter()


@router.post("/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserSignup, response: Response, db: db_dep):
    created_user = User.create_user(db, user)
    access_token = create_access_token(data={"sub": created_user.username, "id": str(created_user.id), "role": created_user.role})

    refresh_token = create_refresh_token(data={"id": str(created_user.id)})
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax")

    return LoginResponse(user=created_user, access_token=access_token, token_type="bearer")


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, db: db_dep):
    user = User.authenticate_user(form_data.username, form_data.password, db)
    access_token = create_access_token(data={"sub": user.username, "id": str(user.id), "role": user.role})

    refresh_token = create_refresh_token(data={"id": str(user.id)})
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax")

    return LoginResponse(user=user, access_token=access_token, token_type="bearer")


@router.get("/google/login", status_code=status.HTTP_200_OK)
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")  # re route for method /google/callback, its defined name="google_callback" below
    return await oauth.google.authorize_redirect(request, redirect_uri)
    # here the request object is sent to google to handle it and redirect back using it + redirect_uri


@router.get("/google/callback", status_code=status.HTTP_200_OK, name="google_callback")
async def google_callback(request: Request, db: db_dep):
    # 1) Get token from Google
    token = await oauth.google.authorize_access_token(request)

    # 2) Get user's info from Google
    #   - email, username, given_name, family_name, picture, sub (google id)
    try:
        user_info = await oauth.google.parse_id_token(request, token)
    except Exception:
        user_info = None
    if not user_info:
        user_info = await oauth.google.userinfo(token=token)  # Another method of getting user info if the first failed (sometimes happens)

    # 3) Check user info is returned correctly and holding the required data.
    #    We only check email assuming the rest will be there if email is.
    if not user_info or "email" not in user_info:
        raise invalid_token_exception

    email = user_info["email"]
    name = user_info.get("name", email.split("@")[0])  # if no username, use the part before @ in email
    google_id = user_info["sub"]

    # 4) Check if user with this google_id exists, if not -> create.
    user = User.get_user_by_google_id(google_id, db)
    if not user:
        user = User.create_user(
            db,
            UserCreate(
                username=name,
                first_name=user_info.get("given_name", None),
                last_name=user_info.get("family_name", None),
                email=email,
                google_id=google_id,
                avatar=user_info.get("picture", None),
                password=None,
            ),
            from_google=True,
        )

    # 5) User already exists with this google_id -> normal login, create refresh token in frontend cookie and redirect it.
    refresh_token = create_refresh_token(data={"id": str(user.id)})

    frontend_callback = os.environ.get("FRONTEND_REDIRECT_URL")
    response = RedirectResponse(url=frontend_callback)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="lax")

    return response


@router.get("/me", response_model=CurrentUser, status_code=status.HTTP_200_OK)
def read_current_user(current_user: current_user_dep):
    """For testing only"""
    return current_user


@router.post("/refresh", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def refresh_access_token(db: db_dep, refresh_token: Annotated[str | None, Cookie()] = None):
    if not refresh_token:
        raise invalid_token_exception

    user_id = decode_refresh_token(refresh_token)

    user = User.get_user(user_id, db)
    if user is None:
        raise invalid_token_exception

    access_token = create_access_token(data={"sub": user.username, "id": str(user.id), "role": user.role})
    return LoginResponse(user=user, access_token=access_token, token_type="bearer")


@router.put("/", response_model=UserRetrieve, status_code=status.HTTP_200_OK)
async def update_user(
        current_user: current_user_dep,
        db: db_dep,
        background_tasks: BackgroundTasks,
        user_update: Annotated[UserUpdate, Depends(user_update_mapper)],
        avatar: UploadFile | None = File(None),
):
    updated_user = await User.update_user(current_user.id, user_update, avatar, db, background_tasks)
    return updated_user
