import datetime as dt
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from .models import PaymentMethod


class CategoryBase(BaseModel):
    name: str
    letter: str
    color: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    letter: Optional[str] = None
    color: Optional[str] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ExpenseBase(BaseModel):
    amount: float
    category_id: int
    note: Optional[str] = None
    merchant: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.upi
    date: dt.date


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    merchant: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    date: Optional[dt.date] = None


class ExpenseOut(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: CategoryOut


class CategoryBreakdown(BaseModel):
    category_id: int
    name: str
    letter: str
    color: str
    amount: float
    pct: float


class SummaryOut(BaseModel):
    period: str
    label: str
    total: float
    previous_total: float
    delta_pct: Optional[float]
    breakdown: List[CategoryBreakdown]


class DashboardOut(BaseModel):
    month_total: float
    week_total: float
    top_category: Optional[str]
    monthly_budget: Optional[float]
    recent: List[ExpenseOut]


class SettingsOut(BaseModel):
    monthly_budget: Optional[float]


class SettingsUpdate(BaseModel):
    monthly_budget: Optional[float] = None
