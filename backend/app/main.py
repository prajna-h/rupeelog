from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import crud
from .database import Base, engine, SessionLocal
from .routers import categories, expenses, summary, dashboard, settings

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    crud.seed_defaults(db)

app = FastAPI(title="RupeeLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(summary.router)
app.include_router(dashboard.router)
app.include_router(settings.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
