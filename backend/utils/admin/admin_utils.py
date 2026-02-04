from schema import CurrentUser, UserRole
from exceptions import not_admin_exception
from ..deps import current_user_dep


def verify_admin(current_user: current_user_dep) -> CurrentUser:
    if current_user.role != UserRole.ADMIN:
        raise not_admin_exception

    return current_user
