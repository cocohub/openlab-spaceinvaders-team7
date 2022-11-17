from fastapi import APIRouter
from .service import example


router = APIRouter(prefix="/highscore", tags=["Highscore"])


@router.get("/highscore")
async def get_highscore():
    return await example.get("key")


@router.get("/highscore/{name}")
async def get_highscore_by_name(name: str):
    return await example.get(name)


@router.post("/highscore")
async def post_highscore(data):
    value = await example("key", data)
    print(value)
    return value


@router.delete("/highscore/{name}")
async def delete_highscore_by_name(name: str):
    return ""

@router.get("/example")
async def test():
    data = { "text": "this is some random data" }
    value = await example("test key", data)
    print(value)
    return value
    
