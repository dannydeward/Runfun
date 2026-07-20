from sqlalchemy import Column, Integer, Float, String, Boolean
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Reto(Base):
    __tablename__ = "retos"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    km_objetivo = Column(Float, nullable=False)

    plazo_valor = Column(Integer, nullable=False)

    plazo_unidad = Column(
        String,
        nullable=False
    )  # horas, dias, semanas, meses, años

    km_actual = Column(
        Float,
        default=0
    )
    tipo = Column(
        String,
        nullable=False,
        default="base"
    )

    activo = Column(
        Boolean,
        default=True
    )

    fecha_inicio = Column(
        DateTime,
        default=datetime.utcnow
    )

    fecha_fin = Column(
        DateTime,
        nullable=True
    )

    usuario = relationship(
        "User",
        back_populates="retos"
    )


class RetoEquipo(Base):
     __tablename__ = "retos_equipo"

     id = Column(Integer, primary_key=True, index=True)

     equipo_id = Column(
        Integer,
        ForeignKey("equipos.id"),
        nullable=False
    )

     km_objetivo = Column(
        Float,
        nullable=False
    )

     plazo_valor = Column(
        Integer,
        nullable=False
    )

     plazo_unidad = Column(
        String,
        nullable=False
    )

     km_actual = Column(
        Float,
        default=0
    )
    
     tipo = Column(
        String,
        nullable=False,
        default="base"
    )
     activo = Column(
        Boolean,
        default=True
    )

     fecha_inicio = Column(
        DateTime,
        default=datetime.utcnow
    )

     fecha_fin = Column(
        DateTime,
        nullable=True
    )

     equipo = relationship(
        "Team",
        back_populates="retos_equipo"
    )