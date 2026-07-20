from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import SessionLocal
from app.models.carrera import Carrera
from app.models.user import User
from app.models.team import Team
from app.schemas.carrera import CarreraCreate
from app.security.dependencies import obtener_usuario_actual
from app.models.reto import Reto, RetoEquipo


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/carreras")
def registrar_carrera(
    carrera: CarreraCreate,
    usuario_actual: User = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    usuario = db.query(User).filter(
        User.id == usuario_actual.id
    ).first()

    # -----------------------------
    # Cálculo de velocidad
    # -----------------------------
    tiempo_minutos = max(1, carrera.tiempo_minutos)

    tiempo_horas = tiempo_minutos / 60

    velocidad = carrera.distancia / tiempo_horas

    if velocidad > 25:
        return {
            "error": "Velocidad inválida",
            "velocidad_detectada": round(velocidad, 2)
        }

    # -----------------------------
    # Crear carrera
    # -----------------------------
    nueva_carrera = Carrera(
        usuario_id=usuario.id,
        distancia=carrera.distancia,
        tiempo_minutos=tiempo_minutos,
        velocidad=round(velocidad, 2)
    )

    db.add(nueva_carrera)

    # -----------------------------
    # Actualizar kilómetros usuario
    # -----------------------------
    usuario.km_totales = (usuario.km_totales or 0) + carrera.distancia

    # -----------------------------
    # Actualizar kilómetros equipo
    # -----------------------------
    if usuario.equipo_id:

        equipo = db.query(Team).filter(
            Team.id == usuario.equipo_id
        ).first()

        if equipo:
            equipo.km_totales = (equipo.km_totales or 0) + carrera.distancia

    # ===================================================
    # RETOS
    # ===================================================

    if usuario.equipo_id:

        reto_equipo = db.query(RetoEquipo).filter(
            RetoEquipo.equipo_id == usuario.equipo_id,
            RetoEquipo.activo == True
        ).first()

        if reto_equipo:

            reto_equipo.km_actual += carrera.distancia

    else:

        reto = db.query(Reto).filter(
            Reto.usuario_id == usuario.id,
            Reto.tipo == "individual",
            Reto.activo == True
        ).first()

        if not reto:

            reto = db.query(Reto).filter(
                Reto.usuario_id == usuario.id,
                Reto.tipo == "base"
            ).first()

        if reto:

            reto.km_actual += carrera.distancia

            if reto.km_actual >= reto.km_objetivo:

                # terminó un reto individual
                if reto.tipo == "individual":

                    reto.activo = False

                    reto.fecha_fin = datetime.utcnow()

                    reto_base = db.query(Reto).filter(
                        Reto.usuario_id == usuario.id,
                        Reto.tipo == "base"
                    ).first()

                    if reto_base:

                        reto_base.activo = True
                        reto_base.km_actual = 0
                        reto_base.fecha_inicio = datetime.utcnow()
                        reto_base.fecha_fin = None

                # terminó el reto base
                elif reto.tipo == "base":

                    reto.km_actual = 0
                    reto.fecha_inicio = datetime.utcnow()
                    reto.fecha_fin = None

    # -----------------------------
    # Guardar
    # -----------------------------
    db.commit()

    db.refresh(nueva_carrera)

    return {
        "mensaje": "Carrera registrada",
        "km_sumados": carrera.distancia,
        "velocidad": round(velocidad, 2),
        "fecha": nueva_carrera.fecha
    }

@router.get("/usuarios/{usuario_id}/carreras")
def historial_carreras(
    usuario_id: int,
    db: Session = Depends(get_db)
):

    carreras = db.query(Carrera).filter(
        Carrera.usuario_id == usuario_id
    ).all()

    return carreras