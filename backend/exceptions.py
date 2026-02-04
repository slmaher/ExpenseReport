from fastapi import HTTPException, status

# Database exceptions
invalid_db_excpetion = ValueError("DATABASE_URL is not set")

# Auth exceptions
user_exists_exception = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email or username already exists.")
auth_failed_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
invalid_token_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Expense reports exceptions
invalid_expense_status_exception = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid expense status.")
invalid_expense_update_exception = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending expense reports can be modified.")
bad_expense_access_exception = HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                             detail="Expense report doesn't exist or you are not authorized to access it.")

# Admin exceptions
not_admin_exception = HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                    detail="You do not have the necessary permissions to access this resource.")
user_not_found_exception = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
change_own_role_exception = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot change your own role.")

# General exceptions
internal_server_exception = HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error.")
