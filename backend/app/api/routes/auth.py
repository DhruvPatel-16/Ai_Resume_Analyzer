from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and returns an access token."""
    user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserResponse.model_validate(current_user)
