from fastapi import APIRouter, Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session

from app.security.auth import get_current_user
from app.database import get_db
from app.models.team import Team
from app.models.user import User
from app.schemas.team import TeamCreate


router = APIRouter()






# =========================
# CREAR EQUIPO
# =========================

@router.post("/equipos")

def crear_equipo(
    equipo: TeamCreate,
    db: Session = Depends(get_db),
    usuario: User = Depends(get_current_user)
):
    print(">>> ENTRÉ A CREAR EQUIPO <<<")
    nuevo = Team(
        nombre=equipo.nombre,
        descripcion=equipo.descripcion
    )

    db.add(nuevo)
    db.commit()
    db.query(User).filter(User.id == usuario.id).update(
    {"equipo_id": nuevo.id}
)

    db.commit()


    print("DEBUG USER:", usuario.id, usuario.equipo_id)
    
    return {
        "mensaje": "Equipo creado",
        "id": nuevo.id
    }



# =========================
# LISTAR EQUIPOS
# =========================

@router.get("/equipos")
def listar_equipos(
    db: Session = Depends(get_db)
):

    return db.query(Team).all()



# =========================
# UNIRSE A EQUIPO
# =========================

@router.post("/equipos/{equipo_id}/unirse")
def unirse_equipo(
    equipo_id: int,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    equipo = db.query(Team).filter(Team.id == equipo_id).first()

    if not equipo:
        return {"error": "Equipo no encontrado"}

    if usuario.equipo_id == equipo_id:
        return {"mensaje": "Ya perteneces a este equipo"}

    # actualizar en BD (forma segura)
    db.query(User).filter(User.id == usuario.id).update(
        {"equipo_id": equipo_id}
    )

    db.commit()

    return {
        "mensaje": f"{usuario.nombre} se unió a {equipo.nombre}",
        "equipo_id": equipo.id,
        "equipo": equipo.nombre
    }

# =========================
# ELIMINAR EQUIPO
# =========================
@router.delete("/equipos/{equipo_id}")
def eliminar_equipo(
    equipo_id: int,
    db: Session = Depends(get_db)
):

    equipo = db.query(Team).filter(
        Team.id == equipo_id
    ).first()

    if not equipo:
        raise HTTPException(
            status_code=404,
            detail="Equipo no encontrado"
        )

    integrantes = db.query(User).filter(
        User.equipo_id == equipo_id
    ).count()

    if integrantes > 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar un equipo con integrantes"
        )

    db.delete(equipo)
    db.commit()

    return {
        "mensaje": "Equipo eliminado correctamente"
    }

# =========================
# RANKING INTERNO EQUIPO
# =========================

@router.get("/equipos/{equipo_id}/ranking")
def ranking_interno_equipo(
    equipo_id: int,
    db: Session = Depends(get_db)
):

    usuarios = db.query(User).filter(
        User.equipo_id == equipo_id
    ).all()


    ranking = []

    for u in usuarios:

        ranking.append({
            "nombre": u.nombre,
            "apellido": u.apellido,
            "km": u.km_totales or 0
        })


    ranking.sort(
        key=lambda x: x["km"],
        reverse=True
    )


    return ranking




# =========================
# DETALLE EQUIPO
# =========================

@router.get("/equipos/{equipo_id}/detalle")
def detalle_equipo(
    equipo_id: int,
    db: Session = Depends(get_db)
):

    equipo = db.query(Team).filter(
        Team.id == equipo_id
    ).first()


    if not equipo:

        return {
            "error": "Equipo no encontrado"
        }



    usuarios = db.query(User).filter(
        User.equipo_id == equipo_id
    ).all()



    km_total = sum(
        u.km_totales or 0
        for u in usuarios
    )



    ranking = sorted(
        [
            {
                "nombre": u.nombre,
                "apellido": u.apellido,
                "km": u.km_totales or 0
            }
            for u in usuarios
        ],
        key=lambda x: x["km"],
        reverse=True
    )


    return {

        "equipo": equipo.nombre,

        "descripcion": equipo.descripcion,

        "km_totales": km_total,

        "cantidad_integrantes": len(usuarios),

        "ranking": ranking

    }


@router.post("/mi-equipo/salir")
def salir_del_equipo(
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if usuario.equipo_id is None:
        return {"error": "No perteneces a ningún equipo"}

    db.query(User).filter(
        User.id == usuario.id
    ).update(
        {"equipo_id": None}
    )

    db.commit()

    return {
        "mensaje": "Has salido del equipo"
    }