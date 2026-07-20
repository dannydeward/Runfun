from sqlalchemy import Column, Integer, String, Float, ForeignKey,   DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    edad = Column(Integer)
    pais = Column(String)
    ciudad = Column(String)
    foto = Column(String, nullable=True)
    descripcion = Column(String, nullable=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)

    km_totales = Column(Float, default=0)

    # relación con equipo (FK)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=True)

    # relación con carreras (ya funciona)
    carreras = relationship(
        "Carrera",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )
    retos = relationship(
    "Reto",
    back_populates="usuario"
)