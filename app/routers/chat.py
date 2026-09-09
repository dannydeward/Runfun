from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.mensaje import Mensaje
from app.models.user import User
from app.security.dependencies import obtener_usuario_actual


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/chat/mensajes")
def enviar_mensaje(
    contenido: str = Form(...),
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    nuevo_mensaje = Mensaje(
        usuario_id=usuario_actual.id,
        contenido=contenido
    )

    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)

    return {
        "mensaje": "Mensaje enviado",
        "id": nuevo_mensaje.id,
        "contenido": nuevo_mensaje.contenido,
        "fecha": nuevo_mensaje.fecha
    }


@router.get("/chat/mensajes")
def obtener_mensajes(
    db: Session = Depends(get_db)
):

    mensajes = (
        db.query(Mensaje, User.nombre, User.apellido)
        .join(User, Mensaje.usuario_id == User.id)
        .order_by(Mensaje.fecha.asc())
        .all()
    )

    return [
        {
            "id": mensaje.id,
            "usuario_id": mensaje.usuario_id,
            "nombre": nombre,
            "apellido": apellido,
            "contenido": mensaje.contenido,
            "fecha": mensaje.fecha
        }
        for mensaje, nombre, apellido in mensajes
    ]

