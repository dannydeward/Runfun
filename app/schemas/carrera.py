from pydantic import BaseModel


class CarreraCreate(BaseModel):
    distancia: float
    tiempo_minutos: int