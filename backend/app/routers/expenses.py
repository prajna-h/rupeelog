import datetime as dt
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("", response_model=list[schemas.ExpenseOut])
def list_expenses(
    start: Optional[dt.date] = None,
    end: Optional[dt.date] = None,
    category_id: Optional[int] = None,
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
):
    return crud.list_expenses(db, start=start, end=end, category_id=category_id, limit=limit)


@router.post("", response_model=schemas.ExpenseOut)
def create_expense(data: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db, data)


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: int, data: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    exp = crud.update_expense(db, expense_id, data)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    return exp


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    if not crud.delete_expense(db, expense_id):
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"ok": True}
