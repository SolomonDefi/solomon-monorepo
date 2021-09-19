from typing import Optional

from pydantic import BaseModel


# Shared properties
class UploadItemBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


# Properties to receive on item creation
class UploadItemCreate(UploadItemBase):
    title: str


# Properties to receive on item update
class UploadItemUpdate(UploadItemBase):
    pass


# Properties shared by models stored in DB
class UploadItemInDBBase(UploadItemBase):
    id: int
    title: str
    owner_id: int

    class Config:
        orm_mode = True


# Properties to return to client
class UploadItem(UploadItemInDBBase):
    pass


# Properties properties stored in DB
class UploadItemInDB(UploadItemInDBBase):
    pass
