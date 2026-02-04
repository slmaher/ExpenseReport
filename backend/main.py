from fastapi import FastAPI, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from services import auth_router, expenses_router, admin_router, configure_cloudinary
from utils import verify_admin
from dotenv import load_dotenv
import os

load_dotenv()

CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")
configure_cloudinary(CLOUDINARY_URL)

app = FastAPI(title="expense reports API")

origins = ["http://localhost:5173", "http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

# To enable session management for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY"),
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(expenses_router, prefix="/reports", tags=["Expense Reports"])
app.include_router(admin_router, prefix="/admin", tags=["Admin Dashboard"], dependencies=[Depends(verify_admin)])


@app.get("/")
def read_root():
    return JSONResponse(content={"message": "Welcome to the expense reports api this message from the backend :)"})
