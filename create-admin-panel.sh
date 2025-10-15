#!/bin/bash

# Script to create O3 TT Gifts Admin Panel
# Run this from the project root directory

echo "🚀 Creating O3 TT Gifts Admin Panel..."

# Create admin-panel directory if it doesn't exist
if [ ! -d "admin-panel" ]; then
  echo "📦 Creating Vue 3 project with Vite..."
  npm create vite@latest admin-panel -- --template vue-ts

  cd admin-panel

  echo "📚 Installing dependencies..."
  npm install
  npm install vue-router pinia axios firebase
  npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
  npm install -D @tailwindcss/forms

  echo "🎨 Initializing Tailwind CSS..."
  npx tailwindcss init -p

  cd ..
else
  echo "✅ admin-panel directory already exists"
fi

echo "✨ Admin panel structure created!"
echo ""
echo "Next steps:"
echo "1. Copy the admin panel source files (I'll provide these)"
echo "2. cd admin-panel && npm install"
echo "3. npm run dev (to test locally)"
echo "4. npm run build (to build for production)"
echo ""
echo "📝 See ADMIN_PANEL_SETUP.md for complete deployment instructions"
