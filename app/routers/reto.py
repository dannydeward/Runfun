from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app.database import get_db
from app.models.reto import Reto, RetoEquipo
from app.models.user import User
from app.schemas.reto import Reto as RetoSchema, RetoEquipoSchema 
from app.security.auth import get_current_user

router = APIRouter()


@router.post("/retos")
def crear_reto(
    datos: RetoSchema,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Desactivar retos anteriores
    db.query(Reto).filter(
        Reto.usuario_id == usuario.id,
        Reto.activo == True
    ).update(
        {"activo": False}
    )

    reto = Reto(
        usuario_id=usuario.id,
        km_objetivo=datos.km_objetivo,
        plazo_valor=datos.plazo_valor,
        plazo_unidad=datos.plazo_unidad
    )

    reto = Reto(
    usuario_id=usuario.id,
    km_objetivo=datos.km_objetivo,
    plazo_valor=datos.plazo_valor,
    plazo_unidad=datos.plazo_unidad,
    tipo="individual",
    activo=True
)

    db.add(reto)
    db.commit()
    db.refresh(reto)

    return {
        "mensaje": "Reto creado correctamente"
    }

@router.post("/retos-equipo")
def crear_reto_equipo(
    equipo_id: int,
    datos: RetoEquipoSchema,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Verificar que el usuario pertenece al equipo
    pertenece = db.query(User).filter(
        User.id == usuario.id,
        User.equipo_id == equipo_id
    ).first()

    if not pertenece:
        return {
            "error": "No perteneces a este equipo"
        }


    # Desactivar reto anterior del equipo
    db.query(RetoEquipo).filter(
        RetoEquipo.equipo_id == equipo_id,
        RetoEquipo.activo == True
    ).update(
        {"activo": False}
    )


    reto = RetoEquipo(
        equipo_id=equipo_id,
        km_objetivo=datos.km_objetivo,
        plazo_valor=datos.plazo_valor,
        plazo_unidad=datos.plazo_unidad
    )


    db.add(reto)
    db.commit()
    db.refresh(reto)


    return {
        "mensaje": "Reto de equipo creado correctamente",
        "id": reto.id
    }



@router.get("/retos/activo")
def obtener_reto_activo(
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # 1. Primero revisar reto de equipo
    if usuario.equipo_id:

        reto_equipo = db.query(RetoEquipo).filter(
            RetoEquipo.equipo_id == usuario.equipo_id,
            RetoEquipo.activo == True
        ).first()

        if reto_equipo:
            return {
                "tipo": "equipo",
                "km_actual": reto_equipo.km_actual,
                "km_objetivo": reto_equipo.km_objetivo,
                "plazo_valor": reto_equipo.plazo_valor,
                "plazo_unidad": reto_equipo.plazo_unidad
            }


    # 2. Buscar reto individual
    reto = db.query(Reto).filter(
        Reto.usuario_id == usuario.id,
        Reto.tipo == "individual",
        Reto.activo == True
    ).first()


    if reto:
        return reto


    # 3. Buscar reto base
    reto_base = db.query(Reto).filter(
        Reto.usuario_id == usuario.id,
        Reto.tipo == "base",
        Reto.activo == True
    ).first()


    if reto_base:
        return reto_base


    return {
        "mensaje": "No hay reto activo"
    }
@router.put("/retos/{reto_id}")
def actualizar_reto(
    reto_id: int,
    datos: RetoSchema,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    reto = db.query(Reto).filter(
        Reto.id == reto_id,
        Reto.usuario_id == usuario.id
    ).first()

    if not reto:
        return {
            "error": "Reto no encontrado"
        }

    reto.km_objetivo = datos.km_objetivo
    reto.plazo_valor = datos.plazo_valor
    reto.plazo_unidad = datos.plazo_unidad

    db.commit()

    return {
        "mensaje": "Reto actualizado correctamente"
    }

@router.delete("/retos/{reto_id}")
def eliminar_reto(
    reto_id: int,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    reto = db.query(Reto).filter(
        Reto.id == reto_id,
        Reto.usuario_id == usuario.id
    ).first()

    if not reto:
        return {
            "error": "Reto no encontrado"
        }

    db.delete(reto)
    db.commit()

    return {
        "mensaje": "Reto eliminado correctamente"
    }