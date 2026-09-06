from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.database import Base
from datetime import datetime


class Mensaje(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    contenido = Column(String, nullable=False)

    fecha = Column(
        DateTime,
        default=datetime.utcnow
    )