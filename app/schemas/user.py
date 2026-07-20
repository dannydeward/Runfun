from pydantic import BaseModel
from pydantic import BaseModel
from pydantic import BaseModel

class UserCreate(BaseModel):

    nombre: str
    apellido: str
    email: str
    password: str

    edad: int
    pais: str
    ciudad: str





class UserLogin(BaseModel):
    username: str
    password: str




class UserUpdate(BaseModel):

    nombre: str
    apellido: str
    edad: int
    pais: str
    ciudad: str
    descripcion: str | None = None