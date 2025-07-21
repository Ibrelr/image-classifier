# 🖼️ Smart Image Classifier

A modern AI-powered image classification web application with both Flask backend and static frontend support.

## 🌟 Features

- **Multi-image upload** with drag & drop support
- **Real-time AI classification** using CLIP model (Flask version)
- **Client-side classification** for static deployment (GitHub Pages)
- **Beautiful particle.js animations** with mobile optimization
- **Responsive design** that works on all devices
- **File validation** with size and type checking
- **Image preview** with full-screen modal view

## 🚀 Quick Start

### Option 1: Flask Version (Full AI)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application:**
   ```bash
   python main.py
   ```

3. **Open in browser:**
   ```
   http://127.0.0.1:5000
   ```

### Option 2: Static Version (GitHub Pages)

1. **For GitHub Pages deployment:**
   ```bash
   # Copy template to root for GitHub Pages
   cp templates/index.html index.html
   ```

2. **Or open directly:**
   - Open `templates/index.html` in your browser
   - Works without backend (uses client-side classification)

## 📁 Project Structure

```
image-classifier/
├── main.py              # Flask application (primary)
├── classifier.py        # AI model logic (CLIP)
├── requirements.txt     # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css   # Modern responsive styling
│   └── js/
│       └── scripts.js  # Client-side logic
├── templates/
│   └── index.html      # Main HTML template (works for both Flask and static)
└── uploads/            # Temporary file storage
```

## 🔧 Configuration

### File Limits
- **Maximum file size:** 10MB (client-side), 16MB (Flask)
- **Supported formats:** JPEG, PNG, GIF, WebP
- **Multiple files:** Yes, unlimited

### AI Categories
- People
- Food
- Animals
- Plants
- Nature
- Buildings
- Vehicles
- Other

## 🌐 Deployment Options

### GitHub Pages (Static)
1. Copy template to root: `cp templates/index.html index.html`
2. Push to GitHub repository
3. Enable GitHub Pages in repository settings
4. **Note:** Uses client-side classification (filename-based)

### Heroku (Flask)
1. Add `Procfile`:
   ```
   web: python main.py
   ```
2. Deploy with Heroku CLI or GitHub integration

### Railway/Render
1. Connect GitHub repository
2. Set start command: `python main.py`
3. Deploy automatically

## 🛠️ Development

### Local Development
```bash
# Clone repository
git clone <repository-url>
cd image-classifier

# Install dependencies
pip install -r requirements.txt

# Run Flask development server
python main.py
```

### Testing Static Version
```bash
# Option 1: Copy template to root
cp templates/index.html index.html

# Option 2: Open template directly
# Open templates/index.html in browser
```

### File Validation
The application includes robust file validation:
- File type checking
- Size limit enforcement
- Error handling with user feedback

### Performance Optimizations
- Reduced particles on mobile devices
- Lazy loading of heavy assets
- Memory leak prevention with blob cleanup

## 🎨 Customization

### Styling
Edit `static/css/style.css` to customize:
- Color schemes
- Animation effects
- Layout adjustments

### Classification Logic
**Static version:** Edit `classifyImageClientSide()` in `scripts.js`
**Flask version:** Modify `classifier.py` for different AI models

## 📦 Dependencies

### Python (Flask Version)
- `torch>=2.0.0` - PyTorch framework
- `transformers>=4.30.0` - Hugging Face transformers
- `Pillow>=8.2.0` - Image processing
- `Flask>=2.0.0` - Web framework

### JavaScript (Static Version)
- `particles.js` - Background animations (CDN)
- No additional dependencies

## 🐛 Troubleshooting

### Common Issues

**Large model download:**
- CLIP model (~1.7GB) downloads on first run
- Ensure stable internet connection

**File upload errors:**
- Check file size and format
- Verify browser JavaScript is enabled

**Performance issues:**
- Disable particles on mobile: edit `scripts.js`
- Reduce image resolution before upload

**GitHub Pages deployment:**
- Copy `templates/index.html` to root as `index.html`
- Ensure relative paths work correctly

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions:
- Check the troubleshooting section
- Open an issue on GitHub
- Review the code comments for guidance

---

**Important:** 
- **Flask version:** Uses `templates/index.html` with real AI classification
- **Static version:** Copy `templates/index.html` to root for GitHub Pages deployment
- **Demo Note:** Static version uses filename-based classification for demonstration 