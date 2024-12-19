from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def hello_world():
    return {"message": "hello from FAST"}


class Position(BaseModel):
    x: float
    y: float
    z: float


@app.post("/save-trip")
def save_trip(vectors: list[Position]):
    with open('./test.txt', 'w') as f:
        json.dump([vector.dict() for vector in vectors], f)


@app.get('/get-trip')
def get_trip():
    return FileResponse('./test.txt')


@app.delete('/reset-trip')
def reset_trip():
    if os.path.exists('./test.txt'):
        os.remove('./test.txt')
