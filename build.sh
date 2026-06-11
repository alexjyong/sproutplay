#!/bin/bash

# SproutPlay Build Script
# Builds the Android APK for SproutPlay

set -e

# Parse arguments
CLEAN=false
for arg in "$@"; do
  case "$arg" in
    --clean)
      CLEAN=true
      shift
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

echo "🌱 Building SproutPlay..."

# Clean mode: remove cached artifacts
if [ "$CLEAN" = true ]; then
  echo "🧹 Clean mode — removing cached artifacts..."
  if [ -d "app/node_modules" ]; then
    echo "  Removing node_modules..."
    rm -rf app/node_modules
  fi
  if [ -d "app/android/app/build" ]; then
    echo "  Removing Gradle build outputs..."
    rm -rf app/android/app/build
  fi
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if we're in the right directory
if [ ! -f "app/package.json" ]; then
    echo "❌ Error: package.json not found in app/"
    echo "Make sure you're running this from the sproutplay directory"
    exit 1
fi

# Navigate to app directory
cd app

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build Android debug APK
echo "🔨 Building Android APK..."
cd android

# Check if Gradle wrapper exists
if [ ! -f "gradlew" ]; then
    echo "❌ Error: Gradle wrapper not found"
    exit 1
fi

# Build debug APK
./gradlew assembleDebug

# Return to app directory
cd ..
cd ..
# Find the APK
APK_PATH="app/android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📱 APK location: $APK_PATH"
    echo ""
    echo "To install on a connected device:"
    echo "  adb install $APK_PATH"
else
    echo "❌ Error: APK not found at $APK_PATH"
    exit 1
fi
