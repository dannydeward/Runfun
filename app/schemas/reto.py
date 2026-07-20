from pydantic import BaseModel


class Reto(BaseModel):

    km_objetivo: float

    plazo_valor: int

    plazo_unidad: str

class RetoEquipoSchema(BaseModel):

    km_objetivo: float

    plazo_valor: int

    plazo_unidad: str