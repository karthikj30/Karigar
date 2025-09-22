from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
import google.generativeai as genai
from google.cloud import firestore
from google.cloud import texttospeech
import googlemaps
import os
from dotenv import load_dotenv
import json
import base64
from io import BytesIO
from PIL import Image
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure file upload
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize Firestore
try:
    db = firestore.Client()
except Exception as e:
    print(f"Warning: Firestore not available: {e}")
    db = None
# Search profiles by name or email
@app.route('/api/search-profiles', methods=['GET'])
def search_profiles():
    query = request.args.get('q', '').strip().lower()
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    users_ref = db.collection('users')
    results = []
    for user in users_ref.stream():
        data = user.to_dict()
        if query in data.get('name', '').lower() or query in data.get('email', '').lower():
            results.append({
                'email': data.get('email'),
                'name': data.get('name'),
                'bio': data.get('bio', ''),
                'profile_pic': data.get('profile_pic', ''),
                'posts': data.get('posts', []),
                'followers': data.get('followers', 0),
                'following': data.get('following', 0)
            })
    return jsonify({'success': True, 'results': results})

# Follow a user
@app.route('/api/follow', methods=['POST'])
def follow_user():
    data = request.json
    follower = data.get('follower')  # email of current user
    followee = data.get('followee')  # email of user to follow
    if not follower or not followee:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    # Prevent self-follow
    if follower == followee:
        return jsonify({'success': False, 'error': 'You cannot follow yourself'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    follower_ref = db.collection('users').document(follower)
    followee_ref = db.collection('users').document(followee)
    follower_doc = follower_ref.get()
    followee_doc = followee_ref.get()
    if not follower_doc.exists or not followee_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    # Update following list for follower
    follower_data = follower_doc.to_dict()
    following = set(follower_data.get('following_list', []))
    following.add(followee)
    follower_ref.update({'following_list': list(following), 'following': len(following)})
    # Update followers list for followee
    followee_data = followee_doc.to_dict()
    followers = set(followee_data.get('followers_list', []))
    followers.add(follower)
    followee_ref.update({'followers_list': list(followers), 'followers': len(followers)})
    return jsonify({'success': True, 'message': 'Followed'})

# Unfollow a user
@app.route('/api/unfollow', methods=['POST'])
def unfollow_user():
    data = request.json
    follower = data.get('follower') 
    followee = data.get('followee')
    if not follower or not followee:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    follower_ref = db.collection('users').document(follower)
    followee_ref = db.collection('users').document(followee)
    follower_doc = follower_ref.get()
    followee_doc = followee_ref.get()
    if not follower_doc.exists or not followee_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    # Remove from following list
    follower_data = follower_doc.to_dict()
    following = set(follower_data.get('following_list', []))
    following.discard(followee)
    follower_ref.update({'following_list': list(following), 'following': len(following)})
    # Remove from followers list
    followee_data = followee_doc.to_dict()
    followers = set(followee_data.get('followers_list', []))
    followers.discard(follower)
    followee_ref.update({'followers_list': list(followers), 'followers': len(followers)})
    return jsonify({'success': True, 'message': 'Unfollowed'})
# Initialize Google Maps
maps_key = os.getenv('GOOGLE_MAPS_API_KEY')
if not maps_key or maps_key == "demo-key":
    print("Warning: GOOGLE_MAPS_API_KEY not found. Map features will be disabled.")
    gmaps = None
else:
    try:
        gmaps = googlemaps.Client(key=maps_key)
        try:
            gmaps.geocode("New Delhi, India")
            print("✅ Google Maps API key is working")
        except Exception as e:
            print(f"⚠️  Google Maps API key may have restrictions: {e}")
            print("   Map features will work in browser but may have limited functionality")
    except Exception as e:
        print(f"Warning: Invalid Google Maps API key: {e}")
        gmaps = None

# Initialize Text-to-Speech
try:
    tts_client = texttospeech.TextToSpeechClient()
except Exception as e:
    print(f"Warning: Text-to-Speech not available: {e}")
    tts_client = None

# Configure Google AI
api_key = os.getenv('GOOGLE_AI_API_KEY')
if not api_key or api_key == "demo-key":
    print("Warning: GOOGLE_AI_API_KEY not found. AI features will be disabled.")
    genai_available = False
else:
    try:
        genai.configure(api_key=api_key)
        genai_available = True
    except Exception as e:
        print(f"Warning: Invalid Gemini API key: {e}")
        genai_available = False

# User Sign Up
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        if not email or not password or not name:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        if db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        user_ref = db.collection('users').document(email)
        if user_ref.get().exists:
            return jsonify({'success': False, 'error': 'User already exists'}), 409
        hashed_pw = generate_password_hash(password)
        # Add default profile fields
        user_ref.set({
            'email': email,
            'name': name,
            'password': hashed_pw,
            'bio': '',
            'profile_pic': '',
            'posts': [],
            'followers': 0,
            'following': 0,
            'followers_list': [],
            'following_list': []
        })
        return jsonify({'success': True, 'message': 'User registered successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
# --- Chat API Endpoints ---
from datetime import datetime
from flask import request

def get_chat_id(user1, user2):
    """Generate a unique chat id for a user pair (order-independent)."""
    return '__'.join(sorted([user1, user2]))

# Get chat messages between two users
@app.route('/api/chat/messages', methods=['GET'])
def get_chat_messages():
    user1 = request.args.get('user1')
    user2 = request.args.get('user2')
    if not user1 or not user2:
        return jsonify({'success': False, 'error': 'Missing user(s)'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    chat_id = get_chat_id(user1, user2)
    chat_ref = db.collection('chats').document(chat_id)
    chat_doc = chat_ref.get()
    if not chat_doc.exists:
        return jsonify({'success': True, 'messages': []})
    chat_data = chat_doc.to_dict()
    messages = chat_data.get('messages', [])
    # Sort by timestamp if present
    messages.sort(key=lambda m: m.get('timestamp', ''))
    return jsonify({'success': True, 'messages': messages})

# Send a chat message
@app.route('/api/chat/send', methods=['POST'])
def send_chat_message():
    data = request.json
    sender = data.get('sender')
    receiver = data.get('receiver')
    text = data.get('text', '').strip()
    if not sender or not receiver or not text:
        return jsonify({'success': False, 'error': 'Missing fields'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    chat_id = get_chat_id(sender, receiver)
    chat_ref = db.collection('chats').document(chat_id)
    chat_doc = chat_ref.get()
    msg = {
        'sender': sender,
        'receiver': receiver,
        'text': text,
        'timestamp': datetime.utcnow().isoformat()
    }
    if chat_doc.exists:
        chat_data = chat_doc.to_dict()
        messages = chat_data.get('messages', [])
        messages.append(msg)
        chat_ref.update({'messages': messages})
    else:
        chat_ref.set({'messages': [msg]})
    return jsonify({'success': True, 'message': 'Message sent'})
# User Sign In
@app.route('/api/signin', methods=['POST'])
def signin():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        if db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        user_data = user_doc.to_dict()
        if not check_password_hash(user_data['password'], password):
            return jsonify({'success': False, 'error': 'Incorrect password'}), 401
        # Return all profile fields
        return jsonify({'success': True, 'message': 'Sign in successful', 'user': {
            'email': email,
            'name': user_data.get('name', ''),
            'bio': user_data.get('bio', ''),
            'profile_pic': user_data.get('profile_pic', ''),
            'posts': user_data.get('posts', []),
            'followers': user_data.get('followers', 0),
            'following': user_data.get('following', 0),
            'followers_list': user_data.get('followers_list', []),
            'following_list': user_data.get('following_list', [])
        }})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
# Get user profile
@app.route('/api/profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'success': False, 'error': 'Missing email'}), 400
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    user_data = user_doc.to_dict()
    return jsonify({'success': True, 'user': {
        'email': email,
        'name': user_data.get('name', ''),
        'bio': user_data.get('bio', ''),
        'profile_pic': user_data.get('profile_pic', ''),
        'posts': user_data.get('posts', []),
        'followers': user_data.get('followers', 0),
        'following': user_data.get('following', 0),
        'followers_list': user_data.get('followers_list', []),
        'following_list': user_data.get('following_list', [])
    }})

# Update user profile
@app.route('/api/profile', methods=['POST'])
def update_profile():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'success': False, 'error': 'Missing email'}), 400
    # Simple ownership check: require caller identity header to match target email
    caller = request.headers.get('X-User-Email')
    if not caller or caller != email:
        return jsonify({'success': False, 'error': 'Forbidden: cannot edit another user\'s profile'}), 403
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    update_fields = {}
    for field in ['name', 'bio', 'profile_pic']:
        if field in data:
            update_fields[field] = data[field]
    user_ref.update(update_fields)
    return jsonify({'success': True, 'message': 'Profile updated'})

# Add a post (with title, description, tags, and optional image)
@app.route('/api/add-post', methods=['POST'])
def add_post():
    try:
        data = request.json
        email = data.get('email')
        title = data.get('title')
        description = data.get('description')
        tags = data.get('tags', [])
        image_url = data.get('image_url', '')
        
        print(f"Add post request: email={email}, title={title}, description={description[:50]}..., tags={tags}, image_url={image_url}")
        
        if not email or not title or not description:
            return jsonify({'success': False, 'error': 'Missing required fields (email, title, description)'}), 400
        
        if db is None:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        user_data = user_doc.to_dict()
        posts = user_data.get('posts', [])
        
        # Create new post with all fields
        new_post = {
            'title': title,
            'description': description,
            'tags': tags,
            'image_url': image_url,
            'created_at': datetime.now().isoformat()
        }
        
        posts.append(new_post)
        user_ref.update({'posts': posts})
        
        print(f"Post added successfully. Total posts: {len(posts)}")
        return jsonify({'success': True, 'message': 'Post added', 'post_count': len(posts)})
        
    except Exception as e:
        print(f"Error in add_post: {str(e)}")
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

# Upload image endpoint
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    try:
        print("Upload image request received")
        
        if 'image' not in request.files:
            print("No image file in request")
            return jsonify({'success': False, 'error': 'No image file provided'}), 400
        
        file = request.files['image']
        print(f"File received: {file.filename}, size: {file.content_length}")
        
        if file.filename == '':
            print("Empty filename")
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{uuid.uuid4().hex}{ext}"
            
            # Save file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Generate URL for the uploaded image
            image_url = f"/static/uploads/{unique_filename}"
            
            print(f"Image saved successfully: {image_url}")
            return jsonify({
                'success': True, 
                'image_url': image_url,
                'message': 'Image uploaded successfully'
            })
        else:
            print(f"Invalid file type: {file.filename}")
            return jsonify({'success': False, 'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
            
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'error': f'Upload failed: {str(e)}'}), 500

# Update posts array for a user
@app.route('/api/update-posts', methods=['POST'])
def update_posts():
    data = request.json
    email = data.get('email')
    posts = data.get('posts', [])
    
    if not email:
        return jsonify({'success': False, 'error': 'Missing email'}), 400
    
    # Simple ownership check: require caller identity header to match target email
    caller = request.headers.get('X-User-Email')
    if not caller or caller != email:
        return jsonify({'success': False, 'error': 'Forbidden: cannot edit another user\'s posts'}), 403
    
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    user_ref.update({'posts': posts})
    return jsonify({'success': True, 'message': 'Posts updated'})

# Delete a specific post
@app.route('/api/delete-post', methods=['POST'])
def delete_post():
    data = request.json
    email = data.get('email')
    post_index = data.get('post_index')
    
    if not email or post_index is None:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    # Simple ownership check: require caller identity header to match target email
    caller = request.headers.get('X-User-Email')
    if not caller or caller != email:
        return jsonify({'success': False, 'error': 'Forbidden: cannot delete another user\'s posts'}), 403
    
    if db is None:
        return jsonify({'success': False, 'error': 'Database not available'}), 503
    
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    posts = user_data.get('posts', [])
    
    if post_index < 0 or post_index >= len(posts):
        return jsonify({'success': False, 'error': 'Invalid post index'}), 400
    
    posts.pop(post_index)
    user_ref.update({'posts': posts})
    return jsonify({'success': True, 'message': 'Post deleted'})

# Sample artisan data for demonstration
SAMPLE_ARTISANS = [
    {
        "id": "1",
        "name": "Priya Sharma",
        "craft": "Madhubani Painting",
        "location": {"lat": 26.1200, "lng": 85.3647},
        "city": "Madhubani, Bihar",
        "story": "Fifth generation Madhubani artist preserving traditional techniques",
        "products": ["Wall hangings", "Canvas paintings", "Custom portraits"],
        "image": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400"
    },
    {
        "id": "2", 
        "name": "Rajesh Kumar",
        "craft": "Bamboo Weaving",
        "location": {"lat": 26.2006, "lng": 92.9376},
        "city": "Guwahati, Assam",
        "story": "Master bamboo craftsman creating sustainable home decor",
        "products": ["Baskets", "Lamp shades", "Furniture"],
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
    },
    {
        "id": "3",
        "name": "Sunita Devi",
        "craft": "Block Printing",
        "location": {"lat": 26.2389, "lng": 73.0243},
        "city": "Jaipur, Rajasthan", 
        "story": "Traditional block printing artist with modern design sensibilities",
        "products": ["Fabric", "Cushion covers", "Table runners"],
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    }
]

@app.route('/')
def index():
    return render_template('index.html', maps_api_key=os.getenv('GOOGLE_MAPS_API_KEY'))

@app.route('/map')
def map_page():
    return render_template('map.html', maps_api_key=os.getenv('GOOGLE_MAPS_API_KEY'))

@app.route('/profile')
def profile_page():
    response = make_response(render_template('profile.html'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# USP 1: Story Generation and Posting
@app.route('/api/generate-story', methods=['POST'])
def generate_story():
    try:
        if not genai_available:
            return jsonify({
                'success': False, 
                'error': 'AI service not available. Please check your Gemini API key configuration.'
            }), 503
            
        data = request.json
        artisan_info = data.get('artisan_info', {})
        craft_type = data.get('craft_type', '')
        product_description = data.get('product_description', '')
        
        # Create a detailed prompt for story generation
        prompt = f"""
        Create an engaging story for a local artisan with the following details:
        
        Artisan Information:
        - Name: {artisan_info.get('name', 'Unknown')}
        - Craft: {craft_type}
        - Location: {artisan_info.get('location', 'India')}
        - Experience: {artisan_info.get('experience', 'Several years')}
        
        Product Description: {product_description}
        
        Please generate:
        1. A compelling personal story (2-3 paragraphs)
        2. A product description highlighting unique features
        3. A social media caption (Instagram/Facebook ready)
        4. A short bio for the artisan's profile
        
        Make it authentic, emotional, and appealing to modern digital audiences while respecting traditional craftsmanship.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Parse the response into structured format
        story_content = response.text
        
        return jsonify({
            'success': True,
            'story': story_content,
            'formatted_story': {
                'personal_story': story_content.split('\n\n')[0] if '\n\n' in story_content else story_content,
                'product_description': story_content.split('\n\n')[1] if len(story_content.split('\n\n')) > 1 else '',
                'social_caption': story_content.split('\n\n')[2] if len(story_content.split('\n\n')) > 2 else '',
                'bio': story_content.split('\n\n')[3] if len(story_content.split('\n\n')) > 3 else ''
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# USP 2: Artisan Mapping
@app.route('/api/artisans', methods=['GET'])
def get_artisans():
    try:
        # In a real app, this would fetch from Firestore
        # For now, return sample data
        return jsonify({
            'success': True,
            'artisans': SAMPLE_ARTISANS
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/artisan/<artisan_id>', methods=['GET'])
def get_artisan(artisan_id):
    try:
        artisan = next((a for a in SAMPLE_ARTISANS if a['id'] == artisan_id), None)
        if not artisan:
            return jsonify({'success': False, 'error': 'Artisan not found'}), 404
        
        return jsonify({
            'success': True,
            'artisan': artisan
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# USP 3: Voice Reading of Stories
@app.route('/api/generate-voice', methods=['POST'])
def generate_voice():
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400
        
        if len(text) > 5000:
            return jsonify({'success': False, 'error': 'Text too long. Please keep it under 5000 characters.'}), 400
        
        if not tts_client:
            return jsonify({
                'success': False, 
                'error': 'Text-to-Speech service not available. Please check your Google Cloud configuration.'
            }), 503
        
        # Configure the voice synthesis
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-IN",
            name="en-IN-Wavenet-A",  # Female voice
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        
        # Perform the text-to-speech request
        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Convert audio content to base64 for web delivery
        audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_data': audio_base64,
            'format': 'mp3',
            'text_length': len(text)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Voice generation failed: {str(e)}'}), 500

# USP 4: Design Enhancement Ideas
@app.route('/api/enhance-design', methods=['POST'])
def enhance_design():
    try:
        data = request.json
        craft_type = data.get('craft_type', '')
        current_design = data.get('current_design', '')
        style_preference = data.get('style_preference', 'traditional')
        
        prompt = f"""
        As a design consultant for traditional Indian crafts, suggest 3 creative enhancement ideas for:
        
        Craft Type: {craft_type}
        Current Design: {current_design}
        Style Preference: {style_preference}
        
        For each suggestion, provide:
        1. A brief description of the enhancement
        2. Color palette recommendations
        3. Modern applications or use cases
        4. Target audience appeal
        5. Implementation difficulty (Easy/Medium/Hard)
        
        Make suggestions that honor traditional techniques while appealing to contemporary consumers.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'enhancement_ideas': response.text
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# USP 5: Video Creation (Basic implementation)
@app.route('/api/generate-video-script', methods=['POST'])
def generate_video_script():
    try:
        data = request.json
        artisan_info = data.get('artisan_info', {})
        product_info = data.get('product_info', {})
        platform = data.get('platform', 'youtube')
        
        prompt = f"""
        Create a video script for {platform} showcasing an artisan's work:
        
        Artisan: {artisan_info.get('name', 'Unknown')}
        Craft: {artisan_info.get('craft', 'Traditional Craft')}
        Product: {artisan_info.get('name', 'Handmade Item')}
        Story: {artisan_info.get('story', 'Traditional craftsmanship')}
        
        Create:
        1. Hook (first 5 seconds)
        2. Main content (30-60 seconds)
        3. Call-to-action
        4. Visual cues and timing
        5. Suggested background music style
        
        Make it engaging for social media audiences.
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'video_script': response.text
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# USP 6: Drawing to Art Creation
@app.route('/api/analyze-drawing', methods=['POST'])
def analyze_drawing():
    try:
        if not genai_available:
            return jsonify({
                'success': False, 
                'error': 'AI service not available. Please check your Gemini API key configuration.'
            }), 503
            
        data = request.json
        image_data = data.get('image_data', '')  # Base64 encoded image
        craft_type = data.get('craft_type', '')
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        if not craft_type:
            return jsonify({'success': False, 'error': 'Craft type is required'}), 400
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(BytesIO(image_bytes))
            
            # Convert image to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image if too large (Gemini has size limits)
            max_size = 1024
            if image.width > max_size or image.height > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert back to bytes for API
            img_buffer = BytesIO()
            image.save(img_buffer, format='JPEG', quality=85)
            img_buffer.seek(0)
            
        except Exception as e:
            return jsonify({'success': False, 'error': f'Invalid image format: {str(e)}'}), 400
        
        # Use Gemini Vision API for image analysis
        try:
            # Use the vision model for actual image analysis
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Prepare the image for analysis
            img_buffer = BytesIO()
            image.save(img_buffer, format='JPEG', quality=85)
            img_buffer.seek(0)
            
            prompt = f"""
            Analyze this uploaded drawing/sketch image for potential traditional craft applications in {craft_type}.
            
            Please examine the actual image and provide a detailed analysis including:
            
            1. **Design Interpretation and Key Elements:** Describe the shapes, lines, patterns, colors, and overall aesthetic of the sketch, identifying its key visual components.
            
            2. **Suggested Traditional Techniques:** Based on the design, suggest appropriate {craft_type} techniques like hand-building (pinch, coil, slab), wheel throwing, sgraffito, incising, stamping, or others that would best capture the essence of the sketch.
            
            3. **Color Scheme Recommendations:** Suggest color palettes suitable for {craft_type}, considering the design's style and potential firing effects. Consider both earthenware and stoneware possibilities.
            
            4. **Creative Variations:** Propose three alternative interpretations of the design, exploring different stylistic approaches while respecting the original vision.
            
            5. **Market Appeal and Target Audience:** Assess the potential market for the {craft_type} based on the design's aesthetic, and suggest a target audience (e.g., collectors, home décor enthusiasts, gift buyers).
            
            6. **Implementation Difficulty Level:** Rate the difficulty of adapting the sketch into a {craft_type} piece, considering the chosen techniques and design complexity (Easy/Medium/Hard).
            
            7. **Materials and Tools:** List the essential materials and tools needed for the chosen {craft_type} techniques.
            
            8. **Step-by-Step Adaptation Process:** Provide a simplified, step-by-step guide on how to translate the sketch into a ceramic piece, including considerations for scaling and shaping.
            
            Focus on how to adapt the drawing into authentic traditional {craft_type} work while maintaining the original artistic vision. Be specific about what you see in the image.
            """
            
            # Use the vision model to analyze the actual image
            response = model.generate_content([prompt, image])
            
            return jsonify({
                'success': True,
                'analysis': response.text
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': f'AI analysis failed: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# USP 7: AI Image Generation
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    try:
        if not genai_available:
            return jsonify({
                'success': False, 
                'error': 'AI service not available. Please check your Gemini API key configuration.'
            }), 503
            
        data = request.json
        prompt = data.get('prompt', '').strip()
        craft_type = data.get('craft_type', '')
        style = data.get('style', 'realistic')
        
        if not prompt:
            return jsonify({'success': False, 'error': 'No prompt provided'}), 400
        
        if len(prompt) > 1000:
            return jsonify({'success': False, 'error': 'Prompt too long. Please keep it under 1000 characters.'}), 400
        
        # Create a detailed prompt for image generation
        enhanced_prompt = f"""
        Generate a high-quality image for traditional {craft_type} craft based on this description: {prompt}
        
        Style: {style}
        
        Please create an image that shows:
        - Traditional {craft_type} techniques and materials
        - Authentic cultural elements
        - Professional craftsmanship appearance
        - Clear, detailed visualization
        - Suitable for artisan inspiration and reference
        
        Make it visually appealing and representative of traditional Indian craftsmanship.
        """
        
        # Use Gemini for image generation (Note: Gemini doesn't directly generate images, 
        # but we can use it to create detailed descriptions that could be used with other image generation APIs)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # For now, we'll generate a detailed description that could be used with DALL-E or other image generation services
        # In a production environment, you would integrate with actual image generation APIs
        response = model.generate_content(enhanced_prompt)
        
        # Since Gemini doesn't generate images directly, we'll return a detailed description
        # and suggest using it with image generation services
        generated_description = response.text
        
        return jsonify({
            'success': True,
            'description': generated_description,
            'enhanced_prompt': enhanced_prompt,
            'suggested_services': [
                'DALL-E 3 (OpenAI)',
                'Midjourney',
                'Stable Diffusion',
                'Adobe Firefly'
            ],
            'note': 'This generates a detailed description that can be used with image generation services. For direct image generation, integrate with DALL-E or similar APIs.'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Image generation failed: {str(e)}'}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Artisan Marketplace API is running'})

def synthesize_speech_with_api_key(text):
    api_key = os.getenv('GOOGLE_TTS_API_KEY')
    url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "input": {"text": text},
        "voice": {"languageCode": "en-IN", "name": "en-IN-Wavenet-A", "ssmlGender": "FEMALE"},
        "audioConfig": {"audioEncoding": "MP3"}
    }
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["audioContent"]

@app.route('/chat.html')
def chat_page():
    return render_template('chat.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
