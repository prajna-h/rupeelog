import datetime as dt
from typing import Optional, List, Tuple

from dateutil.relativedelta import relativedelta
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas

DEFAULT_CATEGORIES = [
    ("Food", "F", "#C96F4A"),
    ("Transport", "T", "#5C7C9C"),
    ("Shopping", "S", "#9C6B8A"),
    ("Bills", "B", "#D9A441"),
    ("Fun", "E", "#6B5CA5"),
    ("Health", "H", "#3F6B52"),
    ("Groceries", "G", "#7A8B4A"),
    ("Other", "O", "#8A8577"),
]


def seed_defaults(db: Session) -> None:
    if db.query(models.Category).count() == 0:
        for name, letter, color in DEFAULT_CATEGORIES:
            db.add(models.Category(name=name, letter=letter, color=color))
    if db.query(models.Settings).count() == 0:
        db.add(models.Settings(monthly_budget=None))
    db.commit()


# ---- Categories ----

def list_categories(db: Session) -> List[models.Category]:
    return db.query(models.Category).order_by(models.Category.id).all()


def create_category(db: Session, data: schemas.CategoryCreate) -> models.Category:
    cat = models.Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, category_id: int, data: schemas.CategoryUpdate) -> Optional[models.Category]:
    cat = db.query(models.Category).get(category_id)
    if not cat:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, category_id: int) -> bool:
    cat = db.query(models.Category).get(category_id)
    if not cat:
        return False
    db.delete(cat)
    db.commit()
    return True


# ---- Expenses ----

def list_expenses(
    db: Session,
    start: Optional[dt.date] = None,
    end: Optional[dt.date] = None,
    category_id: Optional[int] = None,
    limit: Optional[int] = None,
) -> List[models.Expense]:
    q = db.query(models.Expense)
    if start:
        q = q.filter(models.Expense.date >= start)
    if end:
        q = q.filter(models.Expense.date <= end)
    if category_id:
        q = q.filter(models.Expense.category_id == category_id)
    q = q.order_by(models.Expense.date.desc(), models.Expense.created_at.desc())
    if limit:
        q = q.limit(limit)
    return q.all()


def create_expense(db: Session, data: schemas.ExpenseCreate) -> models.Expense:
    exp = models.Expense(**data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def update_expense(db: Session, expense_id: int, data: schemas.ExpenseUpdate) -> Optional[models.Expense]:
    exp = db.query(models.Expense).get(expense_id)
    if not exp:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


def delete_expense(db: Session, expense_id: int) -> bool:
    exp = db.query(models.Expense).get(expense_id)
    if not exp:
        return False
    db.delete(exp)
    db.commit()
    return True


# ---- Period helpers ----

def week_range(ref: dt.date, offset: int = 0) -> Tuple[dt.date, dt.date]:
    start_of_this_week = ref - dt.timedelta(days=ref.weekday())
    start = start_of_this_week + dt.timedelta(weeks=offset)
    end = start + dt.timedelta(days=6)
    return start, end


def month_range(ref: dt.date, offset: int = 0) -> Tuple[dt.date, dt.date]:
    first_of_this_month = ref.replace(day=1)
    start = first_of_this_month + relativedelta(months=offset)
    end = start + relativedelta(months=1) - dt.timedelta(days=1)
    return start, end


def period_ranges(period: str, ref: dt.date) -> Tuple[dt.date, dt.date, dt.date, dt.date, str]:
    if period == "weekly":
        start, end = week_range(ref, 0)
        prev_start, prev_end = week_range(ref, -1)
        label = "this week"
    else:
        start, end = month_range(ref, 0)
        prev_start, prev_end = month_range(ref, -1)
        label = "this month"
    return start, end, prev_start, prev_end, label


def _total_for_range(db: Session, start: dt.date, end: dt.date) -> float:
    total = (
        db.query(func.coalesce(func.sum(models.Expense.amount), 0.0))
        .filter(models.Expense.date >= start, models.Expense.date <= end)
        .scalar()
    )
    return float(total or 0.0)


def _breakdown_for_range(db: Session, start: dt.date, end: dt.date) -> List[schemas.CategoryBreakdown]:
    rows = (
        db.query(
            models.Category.id,
            models.Category.name,
            models.Category.letter,
            models.Category.color,
            func.coalesce(func.sum(models.Expense.amount), 0.0).label("amount"),
        )
        .join(models.Expense, models.Expense.category_id == models.Category.id)
        .filter(models.Expense.date >= start, models.Expense.date <= end)
        .group_by(models.Category.id)
        .order_by(func.sum(models.Expense.amount).desc())
        .all()
    )
    total = sum(r.amount for r in rows) or 0.0
    breakdown = []
    for r in rows:
        pct = round((r.amount / total) * 100, 1) if total else 0.0
        breakdown.append(
            schemas.CategoryBreakdown(
                category_id=r.id, name=r.name, letter=r.letter, color=r.color, amount=r.amount, pct=pct
            )
        )
    return breakdown


def get_summary(db: Session, period: str, ref: Optional[dt.date] = None) -> schemas.SummaryOut:
    ref = ref or dt.date.today()
    start, end, prev_start, prev_end, label = period_ranges(period, ref)
    total = _total_for_range(db, start, end)
    previous_total = _total_for_range(db, prev_start, prev_end)
    delta_pct = None
    if previous_total > 0:
        delta_pct = round(((total - previous_total) / previous_total) * 100, 1)
    breakdown = _breakdown_for_range(db, start, end)
    return schemas.SummaryOut(
        period=period, label=label, total=total, previous_total=previous_total, delta_pct=delta_pct, breakdown=breakdown
    )


def get_dashboard(db: Session) -> schemas.DashboardOut:
    today = dt.date.today()
    week_start, week_end = week_range(today, 0)
    month_start, month_end = month_range(today, 0)

    month_total = _total_for_range(db, month_start, month_end)
    week_total = _total_for_range(db, week_start, week_end)

    month_breakdown = _breakdown_for_range(db, month_start, month_end)
    top_category = month_breakdown[0].name if month_breakdown else None

    settings = db.query(models.Settings).first()
    monthly_budget = settings.monthly_budget if settings else None

    recent = list_expenses(db, limit=5)

    return schemas.DashboardOut(
        month_total=month_total,
        week_total=week_total,
        top_category=top_category,
        monthly_budget=monthly_budget,
        recent=recent,
    )


def get_settings(db: Session) -> models.Settings:
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(monthly_budget=None)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, data: schemas.SettingsUpdate) -> models.Settings:
    settings = get_settings(db)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
