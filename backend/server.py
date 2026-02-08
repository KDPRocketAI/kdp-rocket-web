from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query, UploadFile, File, Form
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
import httpx
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

scheduler = AsyncIOScheduler()
scheduler.start()

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ConnectedAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    platform: str  # 'google_drive', 'youtube', 'instagram', 'twitter', 'facebook'
    account_name: str  # Display name for this account
    account_email: Optional[str] = None  # Email or username
    access_token: str
    refresh_token: Optional[str] = None
    token_uri: str
    client_id: str
    client_secret: str
    scopes: List[str]
    expiry: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScheduledPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    caption: str
    media_urls: List[str]
    platforms: List[str]
    scheduled_time: datetime
    status: str = 'pending'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    error_message: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    caption: str
    platforms: List[str]
    scheduled_time: str
    drive_file_ids: List[str]

def create_jwt_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {'user_id': user_id, 'exp': expire}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.InvalidTokenError:
        return None

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid token')
    
    token = authorization.split(' ')[1]
    user_id = verify_jwt_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    return User(**user)

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    password_hash = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash
    )
    
    await db.users.insert_one(user.model_dump())
    token = create_jwt_token(user.id)
    
    return {
        'success': True,
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail='Invalid email or password')
    
    user = User(**user_doc)
    if not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    
    token = create_jwt_token(user.id)
    
    return {
        'success': True,
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    }

@api_router.get("/connections/status")
async def get_connection_status(user: User = Depends(get_current_user)):
    """Check which platforms are connected and list all accounts"""
    # Get all connected accounts for this user
    accounts = await db.connected_accounts.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    
    # Group by platform
    platforms = {}
    for account in accounts:
        platform = account['platform']
        if platform not in platforms:
            platforms[platform] = []
        platforms[platform].append({
            "id": account['id'],
            "account_name": account.get('account_name', 'Unnamed Account'),
            "account_email": account.get('account_email'),
            "created_at": account.get('created_at')
        })
    
    return {
        "success": True,
        "connections": {
            "google_drive": platforms.get("google_drive", []),
            "youtube": platforms.get("youtube", []),
            "instagram": platforms.get("instagram", []),
            "twitter": platforms.get("twitter", []),
            "facebook": platforms.get("facebook", [])
        }
    }

@api_router.delete("/connections/{platform}/{account_id}")
async def disconnect_account(platform: str, account_id: str, user: User = Depends(get_current_user)):
    """Disconnect a specific account"""
    result = await db.connected_accounts.delete_one({
        "id": account_id,
        "user_id": user.id,
        "platform": platform
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    
    return {"success": True, "message": f"Account disconnected"}

@api_router.get("/drive/connect")
async def connect_drive(account_name: str = Query("My Drive"), user: User = Depends(get_current_user)):
    try:
        redirect_uri = f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/drive/callback"
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.environ.get('GOOGLE_CLIENT_ID', ''),
                    "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=['https://www.googleapis.com/auth/drive.readonly'],
            redirect_uri=redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=f"{user.id}|||{account_name}"  # Pass user_id and account_name
        )
        
        return {"authorization_url": authorization_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate OAuth: {str(e)}")

@api_router.get("/drive/callback")
async def drive_callback(code: str = Query(...), state: str = Query(...)):
    try:
        # Parse state to get user_id and account_name
        state_parts = state.split("|||")
        user_id = state_parts[0]
        account_name = state_parts[1] if len(state_parts) > 1 else "My Drive"
        
        redirect_uri = f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/drive/callback"
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.environ.get('GOOGLE_CLIENT_ID', ''),
                    "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=None,
            redirect_uri=redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Create account record directly as dict
        account_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "platform": "google_drive",
            "account_name": account_name,
            "account_email": None,
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token if credentials.refresh_token else None,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": list(credentials.scopes) if credentials.scopes else [],
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.connected_accounts.insert_one(account_doc)
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        return RedirectResponse(url=f"{frontend_url}/dashboard?drive_connected=true")
    except Exception as e:
        logging.error(f"Drive OAuth failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"OAuth failed: {str(e)}")

@api_router.get("/youtube/connect")
async def connect_youtube(account_name: str = Query("My Channel"), user: User = Depends(get_current_user)):
    try:
        redirect_uri = f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/youtube/callback"
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.environ.get('YOUTUBE_CLIENT_ID', ''),
                    "client_secret": os.environ.get('YOUTUBE_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
            redirect_uri=redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=f"{user.id}|||{account_name}"
        )
        
        return {"authorization_url": authorization_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate YouTube OAuth: {str(e)}")

@api_router.get("/youtube/callback")
async def youtube_callback(code: str = Query(...), state: str = Query(...)):
    try:
        # Parse state
        state_parts = state.split("|||")
        user_id = state_parts[0]
        account_name = state_parts[1] if len(state_parts) > 1 else "My Channel"
        
        redirect_uri = f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/youtube/callback"
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": os.environ.get('YOUTUBE_CLIENT_ID', ''),
                    "client_secret": os.environ.get('YOUTUBE_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=None,
            redirect_uri=redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Create account record directly as dict
        account_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "platform": "youtube",
            "account_name": account_name,
            "account_email": None,
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token if credentials.refresh_token else None,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": list(credentials.scopes) if credentials.scopes else [],
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.connected_accounts.insert_one(account_doc)
        
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        return RedirectResponse(url=f"{frontend_url}/dashboard?youtube_connected=true")
    except Exception as e:
        logging.error(f"YouTube OAuth failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"YouTube OAuth failed: {str(e)}")

async def get_drive_service(account_id: str = Query(None), user: User = Depends(get_current_user)):
    # Get the specified account or the first Google Drive account
    if account_id:
        account_doc = await db.connected_accounts.find_one({
            "id": account_id,
            "user_id": user.id,
            "platform": "google_drive"
        })
    else:
        account_doc = await db.connected_accounts.find_one({
            "user_id": user.id,
            "platform": "google_drive"
        })
    
    if not account_doc:
        raise HTTPException(status_code=400, detail="Google Drive not connected")
    
    # Parse expiry datetime if it exists
    expiry = None
    if account_doc.get("expiry"):
        try:
            expiry_str = account_doc["expiry"]
            if isinstance(expiry_str, str):
                expiry = datetime.fromisoformat(expiry_str.replace('Z', '+00:00'))
        except Exception:
            pass
    
    creds = Credentials(
        token=account_doc["access_token"],
        refresh_token=account_doc.get("refresh_token"),
        token_uri=account_doc["token_uri"],
        client_id=account_doc["client_id"],
        client_secret=account_doc["client_secret"],
        scopes=account_doc["scopes"],
        expiry=expiry
    )
    
    # Check if token needs refresh
    if expiry and creds.refresh_token:
        now = datetime.now(timezone.utc)
        if expiry < now:
            creds.refresh(GoogleRequest())
            await db.connected_accounts.update_one(
                {"id": account_doc["id"]},
                {"$set": {
                    "access_token": creds.token,
                    "expiry": creds.expiry.isoformat() if creds.expiry else None,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return build('drive', 'v3', credentials=creds)

@api_router.get("/drive/files")
async def list_drive_files(account_id: str = Query(None), user: User = Depends(get_current_user)):
    try:
        service = await get_drive_service(account_id, user)
        
        results = service.files().list(
            pageSize=50,
            q="mimeType contains 'image/' or mimeType contains 'video/'",
            fields="files(id, name, mimeType, thumbnailLink, webViewLink, size)"
        ).execute()
        
        files = results.get('files', [])
        return {"success": True, "files": files}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to fetch Drive files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch files: {str(e)}")

@api_router.post("/posts/schedule")
async def schedule_post(post_data: PostCreate, user: User = Depends(get_current_user)):
    try:
        scheduled_dt = datetime.fromisoformat(post_data.scheduled_time.replace('Z', '+00:00'))
        
        post = ScheduledPost(
            user_id=user.id,
            title=post_data.title,
            caption=post_data.caption,
            media_urls=post_data.drive_file_ids,
            platforms=post_data.platforms,
            scheduled_time=scheduled_dt,
            status='pending'
        )
        
        await db.scheduled_posts.insert_one(post.model_dump())
        
        if scheduled_dt > datetime.now(timezone.utc):
            scheduler.add_job(
                publish_post,
                trigger=DateTrigger(run_date=scheduled_dt),
                args=[post.id],
                id=post.id
            )
        
        return {
            'success': True,
            'post_id': post.id,
            'scheduled_for': post.scheduled_time.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/posts/scheduled")
async def get_scheduled_posts(user: User = Depends(get_current_user)):
    posts = await db.scheduled_posts.find({'user_id': user.id}, {'_id': 0}).to_list(100)
    return {"success": True, "posts": posts}

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: User = Depends(get_current_user)):
    post = await db.scheduled_posts.find_one({'id': post_id, 'user_id': user.id})
    if not post:
        raise HTTPException(status_code=404, detail='Post not found')
    
    await db.scheduled_posts.delete_one({'id': post_id})
    
    try:
        scheduler.remove_job(post_id)
    except:
        pass
    
    return {"success": True, "message": "Post deleted"}

async def publish_post(post_id: str):
    post = await db.scheduled_posts.find_one({'id': post_id})
    if not post or post['status'] != 'pending':
        return
    
    try:
        await db.scheduled_posts.update_one(
            {'id': post_id},
            {'$set': {
                'status': 'published',
                'published_at': datetime.now(timezone.utc).isoformat()
            }}
        )
    except Exception as e:
        await db.scheduled_posts.update_one(
            {'id': post_id},
            {'$set': {
                'status': 'failed',
                'error_message': str(e)
            }}
        )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    scheduler.shutdown()
    client.close()