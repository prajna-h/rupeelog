import datetime as dt
from typing import Optional, Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/summary", tags=["summary"])


@router.get("", response_model=schemas.SummaryOut)
def summary(
    period: Literal["weekly", "monthly"] = Query("monthly"),
    ref: Optional[dt.date] = None,
    db: Session = Depends(get_db),
):
    return crud.get_summary(db, period=period, ref=ref)
