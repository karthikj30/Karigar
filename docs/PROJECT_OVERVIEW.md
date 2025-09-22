# 🎨 Karigar - AI-Powered Artisan Marketplace

## Project Summary

**Karigar** is a comprehensive AI-powered platform designed to bridge traditional Indian craftsmanship with modern digital markets. The platform leverages Google Cloud's generative AI to help local artisans tell their stories, reach new audiences, and preserve cultural heritage while embracing innovation.

## 🏗️ Project Structure

```
Karigar/
├── 📁 Backend (Flask)
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── test_app.py           # Comprehensive test suite
│
├── 📁 Frontend (HTML/CSS/JS)
│   ├── templates/
│   │   └── index.html        # Main application interface
│   └── static/
│       ├── css/style.css     # Custom styling
│       └── js/app.js         # Frontend functionality
│
├── 📁 Deployment
│   ├── Dockerfile            # Container configuration
│   ├── app.yaml             # Google App Engine config
│   ├── cloudbuild.yaml      # Cloud Build configuration
│   ├── deploy.sh            # Linux/Mac deployment script
│   └── deploy.bat           # Windows deployment script
│
├── 📁 Configuration
│   ├── env.example          # Environment variables template
│   └── setup.py             # Automated setup script
│
└── 📁 Documentation
    ├── README.md            # Comprehensive documentation
    └── PROJECT_OVERVIEW.md  # This file
```

## 🚀 Core Features Implemented

### 1. **Story Generation & Posting** ✅
- **Technology**: Google Gemini API
- **Features**: 
  - AI-generated artisan stories
  - Social media captions
  - Product descriptions
  - Personalized bios
- **API Endpoint**: `POST /api/generate-story`

### 2. **Interactive Artisan Map** ✅
- **Technology**: Google Maps JavaScript API + Firestore
- **Features**:
  - Location-based artisan discovery
  - Interactive markers with info windows
  - Artisan profile cards
  - Real-time map updates
- **API Endpoints**: `GET /api/artisans`, `GET /api/artisan/<id>`

### 3. **Voice Story Creation** ✅
- **Technology**: Google Cloud Text-to-Speech
- **Features**:
  - Text-to-speech conversion
  - Multiple voice options
  - Audio content for social media
  - MP3 format output
- **API Endpoint**: `POST /api/generate-voice`

### 4. **Design Enhancement Ideas** ✅
- **Technology**: Google Gemini API
- **Features**:
  - AI-powered design suggestions
  - Color palette recommendations
  - Modern application ideas
  - Style preference matching
- **API Endpoint**: `POST /api/enhance-design`

### 5. **Video Script Generation** ✅
- **Technology**: Google Gemini API
- **Features**:
  - Platform-specific scripts (YouTube, Instagram, TikTok)
  - Visual cues and timing
  - Call-to-action suggestions
  - Background music recommendations
- **API Endpoint**: `POST /api/generate-video-script`

### 6. **Drawing to Art Analysis** ✅
- **Technology**: Google Gemini API + Vision capabilities
- **Features**:
  - Sketch analysis and interpretation
  - Traditional craft technique suggestions
  - Design variation recommendations
  - Market appeal assessment
- **API Endpoint**: `POST /api/analyze-drawing`

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **AI Integration**: Google Generative AI (Gemini)
- **Database**: Google Cloud Firestore
- **Maps**: Google Maps JavaScript API
- **TTS**: Google Cloud Text-to-Speech
- **Deployment**: Google Cloud Run

### Frontend
- **Framework**: Vanilla JavaScript + Bootstrap 5
- **Styling**: Custom CSS with modern design
- **Maps**: Google Maps JavaScript API
- **UI Components**: Bootstrap modals and responsive design

### DevOps
- **Containerization**: Docker
- **CI/CD**: Google Cloud Build
- **Platform**: Google Cloud Run
- **Scaling**: Automatic scaling based on CPU utilization

## 🚀 Quick Start Guide

### 1. **Setup Environment**
```bash
# Clone the repository
git clone <repository-url>
cd Karigar

# Run setup script
python setup.py

# Configure environment variables
cp env.example .env
# Edit .env with your API keys
```

### 2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

### 3. **Run Application**
```bash
python app.py
```

### 4. **Access Application**
Open browser: `http://localhost:5000`

### 5. **Test Functionality**
```bash
python test_app.py
```

## 🔧 Configuration Required

### API Keys Needed
1. **Google AI API Key** (Gemini)
   - Get from: https://makersuite.google.com/app/apikey
   - Set as: `GOOGLE_AI_API_KEY`

2. **Google Maps API Key**
   - Get from: https://console.cloud.google.com/google/maps-apis
   - Set as: `GOOGLE_MAPS_API_KEY`

3. **Google Cloud Project ID**
   - Set as: `GOOGLE_CLOUD_PROJECT`

### Google Cloud APIs to Enable
- Google AI API (Gemini)
- Google Maps JavaScript API
- Cloud Text-to-Speech API
- Cloud Firestore API
- Cloud Run API
- Cloud Build API

## 🚀 Deployment Options

### Option 1: Automated Deployment
```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

### Option 2: Manual Deployment
```bash
# Build and push Docker image
docker build -t gcr.io/PROJECT_ID/karigar .
docker push gcr.io/PROJECT_ID/karigar

# Deploy to Cloud Run
gcloud run deploy karigar --image gcr.io/PROJECT_ID/karigar --platform managed --region asia-south1 --allow-unauthenticated
```

### Option 3: Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🧪 Testing

### Automated Testing
```bash
# Run all tests
python test_app.py

# Test specific endpoint
python test_app.py --url http://your-app-url.com
```

### Manual Testing
1. **Health Check**: `GET /api/health`
2. **Story Generation**: Use the web interface
3. **Voice Generation**: Test with sample text
4. **Map Functionality**: Verify artisan locations
5. **Design Enhancement**: Test with different crafts

## 📊 Performance Features

- **Caching**: API response caching
- **Lazy Loading**: Images and content loading
- **Compression**: Gzip compression for static assets
- **Auto-scaling**: Cloud Run automatic scaling
- **Health Monitoring**: Built-in health checks

## 🔒 Security Features

- **CORS**: Configured for specific origins
- **Input Validation**: All inputs validated
- **API Keys**: Secure environment variable storage
- **HTTPS**: SSL/TLS encryption in production
- **Rate Limiting**: Built-in request limiting

## 📈 Scalability

- **Horizontal Scaling**: Cloud Run auto-scaling
- **Database**: Firestore for scalable data storage
- **CDN**: Static asset delivery optimization
- **Load Balancing**: Automatic load distribution

## 🎯 Hackathon Evaluation Criteria

### ✅ AI Usage
- **Gemini API**: Story generation, design enhancement, video scripts
- **Text-to-Speech**: Voice story creation
- **Vision API**: Drawing analysis capabilities

### ✅ Scalability
- **Cloud Run**: Auto-scaling based on demand
- **Firestore**: Scalable NoSQL database
- **Microservices**: Modular architecture

### ✅ User Experience
- **Responsive Design**: Mobile and desktop optimized
- **Interactive Map**: Visual artisan discovery
- **Real-time Features**: Dynamic content updates
- **Intuitive Interface**: Easy-to-use tools

### ✅ Impact
- **Cultural Preservation**: Traditional craft promotion
- **Economic Empowerment**: Artisan market expansion
- **Digital Inclusion**: AI-powered accessibility
- **Community Building**: Artisan network creation

## 🗺️ Future Roadmap

### Phase 2 (Next 3 months)
- [ ] Advanced video generation with actual video creation
- [ ] E-commerce integration for direct sales
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Mobile application (React Native)

### Phase 3 (Next 6 months)
- [ ] AR/VR integration for virtual craft experiences
- [ ] Blockchain authentication for craft authenticity
- [ ] Advanced analytics and insights
- [ ] AI-powered pricing recommendations

### Phase 4 (Next 12 months)
- [ ] Global marketplace expansion
- [ ] Advanced AI features (image generation, style transfer)
- [ ] Community features (forums, workshops)
- [ ] Sustainability tracking and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

- **Email**: info@karigar.ai
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Documentation**: Check README.md for detailed instructions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎨 Made with ❤️ for preserving traditional Indian craftsmanship and empowering local artisans with AI technology.**
