import datetime as dt
import enum

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from .database import Base


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"
    upi = "upi"
    other = "other"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    letter = Column(String(2), nullable=False)
    color = Column(String(7), nullable=False)

    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    note = Column(String, nullable=True)
    merchant = Column(String, nullable=True)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.upi, nullable=False)
    date = Column(Date, nullable=False, default=dt.date.today)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    category = relationship("Category", back_populates="expenses")


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    monthly_budget = Column(Float, nullable=True)
