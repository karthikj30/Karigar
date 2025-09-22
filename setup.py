#!/usr/bin/env python3
"""
Karigar Setup Script
AI-Powered Artisan Marketplace

This script helps you set up the Karigar application with all necessary dependencies
and configuration files.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_banner():
    """Print the application banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║    🎨 Karigar - AI-Powered Artisan Marketplace 🎨          ║
    ║                                                              ║
    ║    Empowering Traditional Artisans with AI Technology       ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_pip():
    """Check if pip is available"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
    except subprocess.CalledProcessError:
        print("❌ Error: pip is not available")
        sys.exit(1)

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def create_env_file():
    """Create .env file from template"""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return
    
    if env_example.exists():
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from template")
        print("⚠️  Please edit .env file with your API keys")
    else:
        print("❌ Error: env.example file not found")

def create_directories():
    """Create necessary directories"""
    directories = [
        "static/css",
        "static/js", 
        "static/images",
        "templates",
        "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Created necessary directories")

def check_google_cloud_setup():
    """Check Google Cloud setup"""
    print("\n🔍 Checking Google Cloud setup...")
    
    # Check if gcloud is installed
    try:
        result = subprocess.run(["gcloud", "--version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Google Cloud CLI is installed")
        else:
            print("⚠️  Google Cloud CLI not found")
    except FileNotFoundError:
        print("⚠️  Google Cloud CLI not found")
        print("   Install from: https://cloud.google.com/sdk/docs/install")

def create_gitignore():
    """Create .gitignore file"""
    gitignore_content = """
# Environment variables
.env
.env.local
.env.production

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Google Cloud
service-account-key.json
*.json

# Temporary files
*.tmp
*.temp
"""
    
    with open(".gitignore", "w") as f:
        f.write(gitignore_content.strip())
    
    print("✅ Created .gitignore file")

def print_next_steps():
    """Print next steps for the user"""
    next_steps = """
    🎉 Setup completed successfully!
    
    📋 Next Steps:
    
    1. 🔑 Get your API keys:
       - Google AI API Key: https://makersuite.google.com/app/apikey
       - Google Maps API Key: https://console.cloud.google.com/google/maps-apis
       
    2. ⚙️  Configure environment:
       - Edit .env file with your API keys
       - Set up Google Cloud project
       
    3. 🚀 Run the application:
       python app.py
       
    4. 🌐 Open your browser:
       http://localhost:5000
       
    5. 📚 Read the documentation:
       - README.md for detailed instructions
       - API documentation in the code
       
    🔗 Useful Links:
    - Google Cloud Console: https://console.cloud.google.com
    - Gemini API Documentation: https://ai.google.dev/docs
    - Google Maps API: https://developers.google.com/maps/documentation
    
    💡 Need help? Check the README.md or create an issue on GitHub.
    """
    print(next_steps)

def main():
    """Main setup function"""
    print_banner()
    
    print("🚀 Starting Karigar setup...")
    
    # Check system requirements
    check_python_version()
    check_pip()
    
    # Create project structure
    create_directories()
    create_env_file()
    create_gitignore()
    
    # Install dependencies
    install_dependencies()
    
    # Check Google Cloud setup
    check_google_cloud_setup()
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    main()
