from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
import cv2
import numpy as np
import base64
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import uvicorn
app = FastAPI()
load_dotenv()
# --- Configuration ---
# In production, load this from a .env file!
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
MATCH_THRESHOLD = float(os.getenv("MATCH_THRESHOLD"))

# print(f"MongoUI is :-{MONGO_URI}")
# print(f"The JWT Secret is :- {JWT_SECRET}")
# print(f"The Match Threshold is :- {MATCH_THRESHOLD}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = AsyncIOMotorClient(MONGO_URI)
db = client.faceauth_db
users_collection = db.users


class ImagePayload(BaseModel):
    username: str
    image_base64: str

def decode_image(base64_string: str):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def get_embedding(img):
   
    result = DeepFace.represent(
        img_path=img, 
        model_name="Facenet", 
        detector_backend="retinaface",
        align=True,
        enforce_detection=True
    )
    return result[0]["embedding"]

def cosine_similarity(vecA, vecB):
 
    return np.dot(vecA, vecB) / (np.linalg.norm(vecA) * np.linalg.norm(vecB))


@app.post("/api/register")
async def register_user(payload: ImagePayload):

    existing_user = await users_collection.find_one({"username": payload.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken.")

    try:
      
        img = decode_image(payload.image_base64)
        embedding = get_embedding(img)
        
        await users_collection.insert_one({
            "username": payload.username,
            "face_embedding": embedding
        })
        return {"message": "User registered successfully with face."}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to process face. Ensure face is visible.")

@app.post("/api/login")
async def login_user(payload: ImagePayload):
   
    stored_user = await users_collection.find_one({"username": payload.username})
    if not stored_user:
        raise HTTPException(status_code=404, detail="User not found.")

    try:
       
        img = decode_image(payload.image_base64)
        live_embedding = get_embedding(img)

        stored_embedding = stored_user["face_embedding"]
        similarity = cosine_similarity(live_embedding, stored_embedding)
        
        print(f"Similarity for {payload.username}: {similarity}")

        if similarity >= MATCH_THRESHOLD:
            
            expiration = datetime.utcnow() + timedelta(hours=1)
            token = jwt.encode({"username": payload.username, "exp": expiration}, JWT_SECRET, algorithm="HS256")
            
            return {"message": "Login successful!", "token": token, "similarity": float(similarity)}
        else:
            raise HTTPException(status_code=401, detail="Face mismatch. Access denied.")

    except Exception as e:
        print(f"the error is : - {e}")
        raise HTTPException(status_code=400, detail="Verification failed.")

if __name__ == "__main__":
    print("the server is starting")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)