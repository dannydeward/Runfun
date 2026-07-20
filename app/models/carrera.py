from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Carrera(Base):
    __tablename__ = "carreras"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    distancia = Column(Float, nullable=False)
    tiempo_minutos = Column(Integer, nullable=False)
    velocidad = Column(Float, nullable=True)

    fecha = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("User", back_populates="carreras")