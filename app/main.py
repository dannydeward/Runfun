from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models.user import User
from app.database import Base

from app.routers.user import router as user_router

from app.models.team import Team
from app.routers.teams import router as team_router

from app.models.carrera import Carrera
from app.routers.carrera import router as carrera_router

from app.routers.ranking import router as ranking_router

from fastapi.staticfiles import StaticFiles

from app.models.reto import Reto
from app.routers.reto import router as reto_router


app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# ==========================
# CORS FRONTEND
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)


app.include_router(user_router)
app.include_router(team_router)
app.include_router(carrera_router)
app.include_router(ranking_router)
app.include_router(reto_router)



@app.get("/")
def inicio():
    return {
        "mensaje": "Bienvenido a RunFun"
    }