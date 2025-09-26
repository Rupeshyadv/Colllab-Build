from fastapi import FastAPI
from pydantic import BaseModel
import redis 

app = FastAPI()

r = redis.Redis(host='localhost', port=6379)

class Help_req(BaseModel):
    roomId: str
    query: str

@app.post("/ai/help")
def get_code(req: Help_req):
    roomId = req.roomId
    
    if not roomId:
        return {"error": "roomId is not provided"}
    
    code = r.get(f'room:{roomId}:code') 
    
    if code is None:
        return {"error": "No code found for the given roomId"}
    
    return {
        "roomId": roomId,
        "code": code
    }