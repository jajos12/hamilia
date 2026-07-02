from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router
from src.core.config import settings

app = FastAPI(
    title="Adversarial Evidence Engine",
    description="A dialectical RAG system that finds both supporting and undermining evidence",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": app.version}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
