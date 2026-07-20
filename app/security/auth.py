from datetime import datetime, timedelta
from jose import jwt, JWTError

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.database import get_db


SECRET_KEY = "runfun_secreto_cambiar_despues"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# -------------------------
# CREAR TOKEN
# -------------------------
def crear_token(data: dict):
    datos = data.copy()

    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    datos.update({"exp": exp})

    return jwt.encode(datos, SECRET_KEY, algorithm=ALGORITHM)


# -------------------------
# AUTH SCHEME
# -------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# -------------------------
# DB SESSION
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# USUARIO ACTUAL
# -------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        usuario = db.query(User).filter(User.id == int(user_id)).first()

        if not usuario:
            raise HTTPException(status_code=401, detail="Usuario no existe")

        return usuario

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")