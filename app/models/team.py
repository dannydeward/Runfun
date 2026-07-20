from sqlalchemy import Column, Integer, String, Float
from app.database import Base
from sqlalchemy.orm import relationship


class Team(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)

    nombre = Column(
        String,
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String
    )

    km_totales = Column(
        Float,
        default=0
    )

    usuarios = relationship("User")

    retos_equipo = relationship(
        "RetoEquipo",
        back_populates="equipo"
    )