#!/bin/bash
# This script is designed to be run in the Cloudflare Pages build environment
# It doesn't rely on pnpm or any other package manager

echo "🚀 Starting Cloudflare Pages build process..."

# Create the deploy directory
mkdir -p .cloudflare/deploy
echo "📁 Created .cloudflare/deploy directory"

# Copy public assets
if [ -d "public" ]; then
  cp -r public/* .cloudflare/deploy/
  echo "📋 Copied public assets"
fi

# Create HTML files
cat > .cloudflare/deploy/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ghibli Vision - AI Image Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f7;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      background-color: #4a6fa5;
      color: white;
      padding: 1rem 0;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    .hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 3rem 0;
      flex-wrap: wrap;
    }
    .hero-content {
      flex: 1;
      min-width: 300px;
      padding-right: 2rem;
    }
    .hero-image {
      flex: 1;
      min-width: 300px;
      text-align: center;
    }
    .hero-image img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .cta-button {
      display: inline-block;
      background-color: #4a6fa5;
      color: white;
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #3a5a8c;
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 1rem 0;
      color: #666;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Ghibli Vision</h1>
      <p>Transform your images into Studio Ghibli-style artwork</p>
    </div>
  </header>
  
  <div class="container">
    <div class="hero">
      <div class="hero-content">
        <h2>Experience the Magic of Studio Ghibli</h2>
        <p>Upload your photos and watch them transform into beautiful Studio Ghibli-inspired artwork using advanced AI technology.</p>
        <p>Our image generator combines the distinctive style of Studio Ghibli with your personal photos to create unique, magical scenes.</p>
        <a href="/dashboard" class="cta-button">Try It Now</a>
      </div>
      <div class="hero-image">
        <img src="/ghibli-sample.jpg" alt="Ghibli Style Image" onerror="this.src='https://placehold.co/600x400?text=Ghibli+Vision'">
      </div>
    </div>
  </div>
  
  <footer class="container">
    <p>&copy; 2025 Ghibli Vision. All rights reserved.</p>
  </footer>
</body>
</html>
EOL

cat > .cloudflare/deploy/dashboard/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Ghibli Vision</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f7;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      background-color: #4a6fa5;
      color: white;
      padding: 1rem 0;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    .dashboard {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 2rem;
      margin-top: 2rem;
    }
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 2rem;
      transition: border-color 0.3s;
      cursor: pointer;
    }
    .upload-area:hover {
      border-color: #4a6fa5;
    }
    .upload-area p {
      margin: 0.5rem 0;
      color: #666;
    }
    .button {
      background-color: #4a6fa5;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #3a5a8c;
    }
    .button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    .preview {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .preview-item {
      flex: 0 0 48%;
      margin-bottom: 2rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .preview-item h3 {
      margin-top: 0;
    }
    .preview-item img {
      max-width: 100%;
      border-radius: 4px;
    }
    .nav-link {
      color: white;
      text-decoration: none;
      margin-left: 1rem;
    }
    footer {
      text-align: center;
      margin-top: 3rem;
      padding: 1rem 0;
      color: #666;
      border-top: 1px solid #ddd;
    }
    @media (max-width: 768px) {
      .preview-item {
        flex: 0 0 100%;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>Ghibli Vision</h1>
      <p>Transform your images into Studio Ghibli-style artwork</p>
      <a href="/" class="nav-link">Home</a>
    </div>
  </header>
  
  <div class="container">
    <div class="dashboard">
      <h2>Image Generator</h2>
      
      <div class="upload-area" id="uploadArea">
        <h3>Upload Your Image</h3>
        <p>Click or drag and drop your image here</p>
        <p>Maximum file size: 5MB</p>
        <input type="file" id="fileInput" style="display: none;" accept="image/*">
      </div>
      
      <button class="button" id="generateButton" disabled>Generate Ghibli Image</button>
      
      <div class="preview">
        <div class="preview-item">
          <h3>Original Image</h3>
          <img id="originalPreview" src="https://placehold.co/600x400?text=Your+Image" alt="Original Image">
        </div>
        <div class="preview-item">
          <h3>Ghibli Style Image</h3>
          <img id="ghibliPreview" src="https://placehold.co/600x400?text=Ghibli+Result" alt="Ghibli Style Image">
        </div>
      </div>
    </div>
  </div>
  
  <footer class="container">
    <p>&copy; 2025 Ghibli Vision. All rights reserved.</p>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const uploadArea = document.getElementById('uploadArea');
      const fileInput = document.getElementById('fileInput');
      const generateButton = document.getElementById('generateButton');
      const originalPreview = document.getElementById('originalPreview');
      
      uploadArea.addEventListener('click', function() {
        fileInput.click();
      });
      
      uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#4a6fa5';
      });
      
      uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#ccc';
      });
      
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#ccc';
        
        if (e.dataTransfer.files.length) {
          handleFile(e.dataTransfer.files[0]);
        }
      });
      
      fileInput.addEventListener('change', function() {
        if (fileInput.files.length) {
          handleFile(fileInput.files[0]);
        }
      });
      
      function handleFile(file) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            originalPreview.src = e.target.result;
            generateButton.disabled = false;
          };
          
          reader.readAsDataURL(file);
        } else {
          alert('Please select an image file.');
        }
      }
      
      generateButton.addEventListener('click', function() {
        alert('This is a static demo. In the full version, this would generate a Ghibli-style image using AI.');
      });
    });
  </script>
</body>
</html>
EOL

# Create directory for dashboard
mkdir -p .cloudflare/deploy/dashboard
echo "📝 Created HTML files"

# Create routes.json for Cloudflare Pages
cat > .cloudflare/deploy/_routes.json << 'EOL'
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
EOL
echo "🌐 Created _routes.json for Cloudflare Pages"

echo "✅ Static site created successfully!"
echo "🌐 Deploy the '.cloudflare/deploy' directory to Cloudflare Pages"
