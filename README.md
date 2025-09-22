  # Karigar - AI-Powered Artisan Marketplace

![Karigar Logo](https://img.shields.io/badge/Karigar-AI%20Powered%20Artisan%20Marketplace-purple?style=for-the-badge&logo=google-cloud)
![WhatsApp Image 2025-09-21 at 22 12 04_fd1dc4ef](https://github.com/user-attachments/assets/62ba9062-e977-4beb-adb7-f5c362934646)

An innovative platform that bridges traditional Indian craftsmanship with modern AI technology, helping local artisans reach new digital audiences and preserve cultural heritage.

## 🌟 Features
![WhatsApp Image 2025-09-21 at 21 37 32_ba37b559](https://github.com/user-attachments/assets/9c14525f-02c2-4d9e-acd6-44b7e90e0f3f)

### Core AI-Powered Tools

1. **📖 Story Generation & Posting**
   - AI-generated compelling stories about artisans and their crafts
   - Social media ready captions and product descriptions
   - Personalized bios and marketing content

2. **🗺️ Interactive Artisan Map**
   - Google Maps integration showing artisan locations
   - Detailed artisan profiles with craft information
   - Location-based discovery and recommendations

3. **🎤 Voice Story Creation**
   - Text-to-Speech conversion of artisan stories
   - Multiple voice options and languages
   - Audio content for social media and marketing
![WhatsApp Image 2025-09-21 at 21 40 41_7fd47fef](https://github.com/user-attachments/assets/50ff1f63-566c-4614-82b4-fa595c941b96)

4. **🎨 Design Enhancement Ideas**
   - AI-powered design suggestions for traditional crafts
   - Color palette recommendations
   - Modern application ideas while preserving tradition
![WhatsApp Image 2025-09-21 at 21 41 25_e11c8065](https://github.com/user-attachments/assets/e2b780f7-15f9-4bcf-a61b-87a75d8f34c0)
![WhatsApp Image 2025-09-21 at 21 38 56_2004124d](https://github.com/user-attachments/assets/0e78c460-7081-453a-83e5-275d4606364b)

5. **🎬 Video Script Generation**
   - Social media video scripts for YouTube, Instagram, TikTok
   - Platform-specific content optimization
   - Visual cues and timing suggestions
![WhatsApp Image 2025-09-21 at 21 43 26_c0590004](https://github.com/user-attachments/assets/6898fd37-eeef-470d-b3dc-1181f807b3be)

6. **✏️ Drawing to Art Analysis**
   - AI analysis of sketches and drawings
   - Traditional craft technique suggestions
   - Design variation recommendations
![WhatsApp Image 2025-09-21 at 21 44 04_ba5271e1](https://github.com/user-attachments/assets/5b1974f0-42d1-4a8d-8383-4e5a73e4a185)
![WhatsApp Image 2025-09-21 at 21 46 58_de665d21](https://github.com/user-attachments/assets/94453b49-f3af-46a4-9a1e-4165959e1f9e)


![WhatsApp Image 2025-09-21 at 21 50 08_ae4f2f6a](https://github.com/user-attachments/assets/110ddccd-1bb7-401c-a5b4-5a75e5242b5c)
![WhatsApp Image 2025-09-21 at 22 09 49_524566f0](https://github.com/user-attachments/assets/c40bee26-f14b-4dc4-a672-e85282ba318f)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Google Cloud Account
- Google AI API Key (Gemini)
- Google Maps API Key
- Google Cloud Project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/karigar.git
   cd karigar
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp config/env.example .env
   # Edit .env with your API keys
   ```

4. **Run the application**
   ```bash
   python start.py
   # OR
   python app.py
   ```

5. **Access the application**
   Open your browser and go to `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GOOGLE_CLOUD_PROJECT=your_project_id_here
FIRESTORE_PROJECT_ID=your_project_id_here
```

### Google Cloud Setup

1. **Enable APIs**
   - Google AI API (Gemini)
   - Google Maps JavaScript API
   - Cloud Text-to-Speech API
   - Cloud Firestore API

2. **Create Service Account**
   - Download service account key
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 📁 Project Structure

```
karigar/
├── 📄 app.py                    # Main Flask application
├── 📄 start.py                  # Simple startup script
├── 📄 requirements.txt          # Python dependencies
├── 📄 setup.py                  # Setup script
├── 📄 README.md                 # This file
├── 📁 config/                   # Configuration files
│   ├── env.example             # Environment variables template
│   └── serviceAccount.json     # Google Cloud service account
├── 📁 deployment/              # Deployment configurations
│   ├── Dockerfile              # Docker configuration
│   ├── app.yaml                # Google App Engine config
│   └── cloudbuild.yaml         # Cloud Build configuration
├── 📁 docs/                    # Documentation
│   └── PROJECT_OVERVIEW.md     # Detailed project overview
├── 📁 static/                  # Static assets
│   ├── css/style.css           # Custom styling
│   ├── js/app.js               # Frontend JavaScript
│   ├── logo.png                # Application logo
│   └── bg.mp4                  # Background video
└── 📁 templates/               # HTML templates
    ├── base.html               # Base template
    ├── index.html              # Home page
    ├── about.html              # About page
    ├── ai_tools.html           # AI tools page
    ├── artisan_map.html        # Artisan map page
    ├── home.html               # Home page variant
    └── profile.html            # Profile page
```

## Architecture

### Backend (Flask)
- **Framework**: Flask with CORS support
- **AI Integration**: Google Gemini API
- **Database**: Google Cloud Firestore
- **Maps**: Google Maps JavaScript API
- **TTS**: Google Cloud Text-to-Speech

### Frontend
- **Framework**: Vanilla JavaScript with Bootstrap 5
- **Styling**: Custom CSS with modern design
- **Maps**: Google Maps JavaScript API
- **UI Components**: Bootstrap modals and components

### Deployment
- **Container**: Docker
- **Platform**: Google Cloud Run
- **CI/CD**: Google Cloud Build
- **Scaling**: Automatic scaling based on CPU utilization

## 📱 Usage

### For Artisans

1. **Generate Stories**
   - Fill in artisan information
   - Select craft type
   - Describe your product
   - Get AI-generated story content

2. **Create Voice Content**
   - Enter your story text
   - Generate audio narration
   - Download for social media

3. **Enhance Designs**
   - Select your craft type
   - Describe current design
   - Get AI suggestions for improvements

4. **Create Video Scripts**
   - Provide artisan and product details
   - Select target platform
   - Generate engaging video scripts

### For Customers

1. **Discover Artisans**
   - Browse interactive map
   - View artisan profiles
   - Learn about traditional crafts

2. **Explore Stories**
   - Read artisan stories
   - Listen to voice narrations
   - Connect with local craftspeople

## 🛠️ API Endpoints

### Story Generation
- `POST /api/generate-story` - Generate artisan stories
- `POST /api/generate-voice` - Convert text to speech
- `POST /api/enhance-design` - Get design enhancement ideas

### Artisan Management
- `GET /api/artisans` - Get all artisans
- `GET /api/artisan/<id>` - Get specific artisan

### Video Creation
- `POST /api/generate-video-script` - Generate video scripts
- `POST /api/analyze-drawing` - Analyze drawings for craft applications

### Health Check
- `GET /api/health` - Application health status

## 🚀 Deployment

### Google Cloud Run

1. **Build and deploy using Cloud Build**
   ```bash
   gcloud builds submit --config deployment/cloudbuild.yaml
   ```

2. **Manual deployment**
   ```bash
   # Build Docker image
   docker build -f deployment/Dockerfile -t gcr.io/PROJECT_ID/karigar .
   
   # Push to Container Registry
   docker push gcr.io/PROJECT_ID/karigar
   
   # Deploy to Cloud Run
   gcloud run deploy karigar --image gcr.io/PROJECT_ID/karigar --platform managed --region asia-south1 --allow-unauthenticated
   ```

### Environment Variables in Cloud Run

Set the following environment variables in Cloud Run:
- `GOOGLE_AI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_CLOUD_PROJECT`

## 🧪 Testing

### Manual Testing

1. **Story Generation**
   - Test with different craft types
   - Verify story quality and relevance
   - Check social media caption generation

2. **Voice Generation**
   - Test with various text lengths
   - Verify audio quality
   - Check different languages

3. **Map Functionality**
   - Test artisan location display
   - Verify marker interactions
   - Check info window content

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test story generation
curl -X POST http://localhost:5000/api/generate-story \
  -H "Content-Type: application/json" \
  -d '{"artisan_info": {"name": "Test Artisan"}, "craft_type": "Pottery", "product_description": "Handmade ceramic bowls"}'
```

## 📊 Performance

### Optimization Features

- **Caching**: API response caching
- **Lazy Loading**: Images and content loading
- **Compression**: Gzip compression for static assets
- **CDN**: Static asset delivery optimization

### Monitoring

- **Health Checks**: Built-in health monitoring
- **Logging**: Comprehensive application logging
- **Metrics**: Performance and usage metrics

## 🔒 Security

### Security Features

- **CORS**: Configured for specific origins
- **Input Validation**: All inputs are validated
- **API Keys**: Secure environment variable storage
- **HTTPS**: SSL/TLS encryption in production

### Best Practices

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Regular security updates and patches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud** for providing the AI and cloud infrastructure
- **Traditional Artisans** for preserving cultural heritage
- **Open Source Community** for the amazing tools and libraries

## 📞 Support
For issues and questions:
1. Check the troubleshooting section above
2. Review the code comments and documentation
3. Create an issue in the project repository
4. Contact the development team

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core AI tools implementation
- ✅ Basic artisan mapping
- ✅ Story generation
- ✅ Voice synthesis

### Phase 2 (Next)
- 🔄 Advanced design analysis
- 🔄 Video generation
- 🔄 E-commerce integration
- 🔄 Multi-language support

### Phase 3 (Future)
- 📋 AR/VR integration
- 📋 Blockchain authentication
- 📋 Advanced analytics
- 📋 Mobile applications

---
![WhatsApp Image 2025-09-21 at 21 47 38_530e9012](https://github.com/user-attachments/assets/a7c4fd85-3f32-4ede-9363-ffb6521818f1)

**Made with ❤️ for preserving traditional Indian craftsmanship**
Made By:  
- Karthik Janardhan | [GitHub](https://github.com/karthikj30) | [LinkedIn](https://www.linkedin.com/in/karthik-janardhan-73a8b12a8/)  
- Anushka Kotal     | [GitHub](https://github.com/anu07718) | [LinkedIn](https://www.linkedin.com/in/anushka-kotal-ab20a22b7/)  
- Riya Vishwakarma  | [GitHub](https://github.com/Riya-1106) | [LinkedIn](https://www.linkedin.com/in/riya-vishwakarma-2540a52b7/)  
- Stash Lopes       | [GitHub](https://github.com/stashlop) | [LinkedIn](https://www.linkedin.com/in/stash-lopes-176068333/)  

*"Empowering the backbone of India's Art culture through technology"*
