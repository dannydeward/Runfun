from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.models.team import Team
from app.models.carrera import Carrera

from app.schemas.user import UserCreate, UserLogin
from app.security.auth import crear_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserUpdate
from app.models.reto import Reto, RetoEquipo

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/usuarios")
def crear_usuario(
    usuario: UserCreate,
    db: Session = Depends(get_db)
):

    nuevo = User(**usuario.dict())

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    # Crear reto predeterminado (5 km semanales)

    reto_base = Reto(
        usuario_id=nuevo.id,
        km_objetivo=5,
        plazo_valor=1,
        plazo_unidad="semanas",
        km_actual=0,
        activo=True
    )

    reto_predeterminado = Reto(
    usuario_id=nuevo.id,
    km_objetivo=5,
    plazo_valor=1,
    plazo_unidad="semanas",
    km_actual=0,
    tipo="base",
    activo=True
)

    db.add(reto_base)
    db.commit()

    return {
        "mensaje": "Usuario creado",
        "id": nuevo.id
    }

@router.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/me")
def me(
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    equipo = db.query(Team).filter(
        Team.id == usuario.equipo_id
    ).first()

    reto = db.query(Reto).filter(
        Reto.usuario_id == usuario.id,
        Reto.activo == True
    ).first()

    reto_equipo = None

    if usuario.equipo_id:

        reto_equipo = db.query(RetoEquipo).filter(
            RetoEquipo.equipo_id == usuario.equipo_id,
            RetoEquipo.activo == True
        ).first()

    return {

        "id": usuario.id,

        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "email": usuario.email,
        "edad": usuario.edad,
        "pais": usuario.pais,
        "ciudad": usuario.ciudad,

        "foto": usuario.foto,
        "descripcion": usuario.descripcion,
        "fecha_registro": usuario.fecha_registro,

        "km": usuario.km_totales,
        "carreras": len(usuario.carreras),

        "equipo": equipo.nombre if equipo else None,
        "equipo_id": usuario.equipo_id,
        "equipo_km": equipo.km_totales if equipo else 0,

        "reto": {

            "km_actual":
                reto_equipo.km_actual
                if reto_equipo
                else reto.km_actual
                if reto
                else 0,

            "km_objetivo":
                reto_equipo.km_objetivo
                if reto_equipo
                else reto.km_objetivo
                if reto
                else 5

        }

    }
@router.put("/me")
def actualizar_perfil(
    datos: UserUpdate,
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    usuario_db = db.query(User).filter(User.id == usuario.id).first()

    usuario_db.nombre = datos.nombre
    usuario_db.apellido = datos.apellido
    usuario_db.edad = datos.edad
    usuario_db.pais = datos.pais
    usuario_db.ciudad = datos.ciudad
    usuario_db.descripcion = datos.descripcion

    db.commit()

    return {
        "mensaje": "Perfil actualizado correctamente"
    }

@router.post("/login")
def login(datos: UserLogin, db: Session = Depends(get_db)):

    usuario = db.query(User).filter(
        User.email == datos.username
    ).first()

    if not usuario:
        return {"error": "Usuario no encontrado"}

    if usuario.password != datos.password:
        return {"error": "Contraseña incorrecta"}

    token = crear_token({
    "sub": str(usuario.id)
})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/token")
def login_token(datos: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    usuario = db.query(User).filter(
        User.email == datos.username
    ).first()

    print("PASS DB:", usuario.password)
    print("PASS INPUT:", datos.password)

    if not usuario:
        return {"error": "Usuario no encontrado"}

    if usuario.password.strip() != datos.password.strip():
        return {"error": "Contraseña incorrecta"}

    token = crear_token({"sub": str(usuario.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "id": usuario.id
    }

from fastapi import UploadFile, File
import shutil
import os

@router.post("/me/foto")
def subir_foto(
    foto: UploadFile = File(...),
    usuario: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    carpeta = "uploads/perfiles"

    os.makedirs(carpeta, exist_ok=True)

    extension = foto.filename.split(".")[-1]

    nombre_archivo = f"{usuario.id}.{extension}"

    ruta = os.path.join(carpeta, nombre_archivo)

    with open(ruta, "wb") as buffer:
        shutil.copyfileobj(foto.file, buffer)

    usuario_db = db.query(User).filter(User.id == usuario.id).first()

    usuario_db.foto = nombre_archivo

    db.commit()

    return {
        "mensaje": "Foto actualizada",
        "foto": nombre_archivo
    }
