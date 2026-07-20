from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.models.team import Team

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# RANKING USUARIOS
# =========================
@router.get("/ranking/usuarios")
def ranking_usuarios(db: Session = Depends(get_db)):

    usuarios = db.query(User).order_by(
        User.km_totales.desc()
    ).all()

    return usuarios


# =========================
# RANKING EQUIPOS
# =========================
@router.get("/ranking/equipos")
def ranking_equipos(db: Session = Depends(get_db)):

    equipos = db.query(Team).all()

    ranking = []

    for equipo in equipos:

        usuarios = db.query(User).filter(
            User.equipo_id == equipo.id
        ).all()

        km_total = sum(u.km_totales for u in usuarios)

        ranking.append({
            "id": equipo.id,
            "nombre": equipo.nombre,
            "km_totales": km_total,
            "integrantes": len(usuarios)
        })

    ranking.sort(key=lambda x: x["km_totales"], reverse=True)

    return ranking