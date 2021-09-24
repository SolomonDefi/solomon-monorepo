from pydantic import BaseModel


# Shared properties
class EvidenceBase(BaseModel):
    title: str
    description: str


# Properties to receive on evidence creation
class EvidenceCreate(EvidenceBase):
    storage_backend: str
    file_key: str
    media_type: str


# Properties to receive on evidence update
class EvidenceUpdate(EvidenceBase):
    pass


# Properties shared by models stored in DB
class EvidenceInDBBase(EvidenceBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


# Properties to return to client
class Evidence(EvidenceInDBBase):
    pass


# Properties properties stored in DB
class EvidenceInDB(EvidenceInDBBase):
    pass
