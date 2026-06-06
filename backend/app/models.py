from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    login: str
    first_name: str
    last_name: str
    role: str


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BuildingBase(BaseModel):
    city: str
    district: Optional[str] = None
    street_address: str


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BuildingBase):
    pass


class Building(BuildingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BuildingManager(BaseModel):
    user_id: int
    building_id: int


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    id: int
    login: str
    first_name: str
    last_name: str
    role: str
