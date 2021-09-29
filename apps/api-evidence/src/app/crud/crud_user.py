from typing import Any, Optional, Union

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models import User
from app.schemas import AddressUserChallenge, UserCreate, UserUpdate
from app.utils.security import EmailPassword


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    password_auth = EmailPassword()

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_eth_address(self, db: Session, *, eth_address: str) -> Optional[User]:
        return db.query(User).filter(User.eth_address == eth_address).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=self.password_auth.hash(obj_in.password),
            full_name=obj_in.full_name,
            is_superuser=obj_in.is_superuser,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data['password']:
            hashed_password = self.password_auth.hash(update_data['password'])
            del update_data['password']
            update_data['hashed_password'] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user or not user.hashed_password:
            return None
        if not self.password_auth.verify(password, user.hashed_password):
            return None
        return user

    def challenge_address_user(
        self, db: Session, *, challenge: AddressUserChallenge
    ) -> User:
        user = self.get_by_eth_address(db, eth_address=challenge.eth_address)
        if not user:
            user = User(eth_address=challenge.eth_address)
            db.add(user)
        user.challenge_hash = challenge.challenge_hash
        user.challenge_expiry = challenge.challenge_expiry
        db.commit()
        db.refresh(user)
        return user


user = CRUDUser(User)
