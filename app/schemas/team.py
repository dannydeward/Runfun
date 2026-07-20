from pydantic import BaseModel

class TeamCreate(BaseModel):
    nombre: str
    descripcion: str