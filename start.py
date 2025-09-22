#!/usr/bin/env python3
"""
Karigar - AI-Powered Artisan Marketplace
Simple startup script for the application
"""

import os
import sys
from pathlib import Path

def main():
    """Start the Karigar application"""
    print("🎨 Starting Karigar - AI-Powered Artisan Marketplace")
    print("=" * 55)
    print()
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  No .env file found. Creating from template...")
        print("   Please edit .env file with your API keys")
        print()
        
        # Copy from template
        try:
            import shutil
            shutil.copy("config/env.example", ".env")
            print("✅ Created .env file from template")
            print("   Edit .env file with your API keys before running again")
            return
        except Exception as e:
            print(f"❌ Error creating .env file: {e}")
            return
    
    print("✅ Environment configuration found")
    print("🚀 Starting Flask application...")
    print("   Open your browser and go to: http://localhost:5000")
    print("   Press Ctrl+C to stop the application")
    print()
    
    try:
        # Import and run the app
        import app
        app.app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    except Exception as e:
        print(f"\n❌ Error running application: {e}")
        print("\n🔍 Troubleshooting:")
        print("   1. Check if all dependencies are installed: pip install -r requirements.txt")
        print("   2. Make sure no other application is using port 5000")
        print("   3. Verify your API keys in .env file")

if __name__ == "__main__":
    main()
