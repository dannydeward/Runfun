from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.security.auth import SECRET_KEY, ALGORITHM


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/token"
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()



def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id = payload.get("sub")


        if usuario_id is None:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )


    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )


    usuario = db.query(User).filter(
        User.id == int(usuario_id)
    ).first()


    if usuario is None:

        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )


    return usuario