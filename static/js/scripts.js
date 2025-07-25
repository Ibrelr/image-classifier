// Initialize particles with inline config instead of loading external file
particlesJS('particles-js', {
  particles: {
    number: {
      value: window.innerWidth < 768 ? 40 : 80, // Reduced on mobile
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: "#ffffff"
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000"
      }
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false
      }
    },
    size: {
      value: 4,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.2,
      width: 1
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: window.innerWidth >= 768, // Disable on mobile for performance
        mode: "grab"
      },
      onclick: {
        enable: true,
        mode: "push"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 200,
        line_linked: {
          opacity: 0.5
        }
      },
      push: {
        particles_nb: 4
      }
    }
  },
  retina_detect: true
}, function() {
  console.log('particles.js config loaded successfully');
});

const form = document.getElementById('uploadForm');
const input = document.getElementById('imageInput');
const resultsSection = document.getElementById('resultsSection');
const classifyBtn = document.getElementById('classifyBtn');

// Maximum file size (16MB to match Flask config)
const MAX_FILE_SIZE = 16 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Check if Flask backend is available
async function checkBackendAvailable() {
  try {
    const response = await fetch('/classify', {
      method: 'HEAD'
    });
    return response.status !== 404;
  } catch (error) {
    return false;
  }
}

// Real AI classification using Flask backend
async function classifyImageWithAI(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/classify', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }
  
  return await response.json();
}

// Fallback client-side classification (improved)
function classifyImageClientSide(file) {
  const fileName = file.name.toLowerCase();
  const fileSize = file.size;
  
  let category = 'Other';
  let confidence = 0.75;

  // Enhanced vehicle detection based on your classifier
  if (fileName.includes('bmw') || fileName.includes('mercedes') || fileName.includes('audi') || 
      fileName.includes('toyota') || fileName.includes('ford') || fileName.includes('honda') ||
      fileName.includes('car') || fileName.includes('vehicle') || fileName.includes('auto') ||
      fileName.includes('truck') || fileName.includes('suv') || fileName.includes('sedan') ||
      fileName.includes('x5') || fileName.includes('x3') || fileName.includes('series')) {
    category = 'Vehicles';
    confidence = 0.90;
  } else if (fileName.includes('person') || fileName.includes('people') || fileName.includes('portrait') || 
             fileName.includes('selfie') || fileName.includes('man') || fileName.includes('woman')) {
    category = 'People';
    confidence = 0.85;
  } else if (fileName.includes('food') || fileName.includes('meal') || fileName.includes('restaurant') || 
             fileName.includes('pizza') || fileName.includes('burger') || fileName.includes('lunch') || 
             fileName.includes('dinner')) {
    category = 'Food';
    confidence = 0.80;
  } else if (fileName.includes('cat') || fileName.includes('dog') || fileName.includes('animal') || 
             fileName.includes('pet') || fileName.includes('bird') || fileName.includes('horse')) {
    category = 'Animals';
    confidence = 0.90;
  } else if (fileName.includes('logo') || fileName.includes('brand') || fileName.includes('burger_king') || 
             fileName.includes('mcdonald')) {
    category = 'Brands';
    confidence = 0.85;
  } else if (fileName.includes('landscape') || fileName.includes('nature') || fileName.includes('mountain') || 
             fileName.includes('beach') || fileName.includes('forest') || fileName.includes('outdoor')) {
    category = 'Nature';
    confidence = 0.80;
  } else if (fileName.includes('building') || fileName.includes('house') || fileName.includes('architecture') || 
             fileName.includes('city') || fileName.includes('office')) {
    category = 'Buildings';
    confidence = 0.75;
  } else if (fileName.includes('cartoon') || fileName.includes('comic') || fileName.includes('animated')) {
    category = 'Cartoon';
    confidence = 0.80;
  } else if (fileName.includes('drawing') || fileName.includes('sketch') || fileName.includes('art')) {
    category = 'Drawing';
    confidence = 0.75;
  } else if (fileName.includes('screenshot') || fileName.includes('screen') || fileName.includes('interface')) {
    category = 'Screenshot';
    confidence = 0.85;
  } else if (fileName.includes('document') || fileName.includes('paper') || fileName.includes('receipt')) {
    category = 'Document';
    confidence = 0.80;
  } else if (fileName.includes('meme') || fileName.includes('funny')) {
    category = 'Meme';
    confidence = 0.75;
  } else if (fileName.includes('medical') || fileName.includes('xray') || fileName.includes('x-ray')) {
    category = 'Medical';
    confidence = 0.85;
  } else {
    // Fallback heuristics
    if (fileSize > 3 * 1024 * 1024) {
      category = 'Nature';
      confidence = 0.60;
    } else if (file.type === 'image/png') {
      category = 'Other';
      confidence = 0.65;
    } else {
      // Default to Other with low confidence
      category = 'Other';
      confidence = 0.45;
    }
  }

  return {
    category: category,
    confidence: `${(confidence * 100).toFixed(1)}%`
  };
}

// Validate file before processing
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not supported. Please use JPEG, PNG, GIF, or WebP images.`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }
  
  return true;
}

// Update file input label when files are selected
input.addEventListener('change', function() {
  const label = document.querySelector('.file-input-label');
  const fileCount = this.files.length;
  
  if (fileCount > 0) {
    // Validate files
    let validFiles = 0;
    for (const file of this.files) {
      try {
        validateFile(file);
        validFiles++;
      } catch (error) {
        console.warn(`File ${file.name}: ${error.message}`);
      }
    }
    
    label.innerHTML = `
      <svg class="file-input-icon" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
      ${validFiles} valid image${validFiles > 1 ? 's' : ''} selected
    `;
    
    // Update button text based on file count
    classifyBtn.innerHTML = `🚀 Classify ${validFiles > 1 ? 'Images' : 'Image'}`;
  }
});

// Global variable to track if backend is available
let backendAvailable = false;

// Check backend availability on page load
window.addEventListener('DOMContentLoaded', async () => {
  backendAvailable = await checkBackendAvailable();
  console.log(`Backend ${backendAvailable ? 'available' : 'not available'} - using ${backendAvailable ? 'AI' : 'fallback'} classification`);
  
  // Update UI to show current mode
  const modeIndicator = document.createElement('div');
  modeIndicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    z-index: 1000;
    ${backendAvailable ? 
      'background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);' : 
      'background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3);'
    }
  `;
  modeIndicator.textContent = backendAvailable ? '🤖 AI Mode' : '📝 Demo Mode';
  document.body.appendChild(modeIndicator);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const files = input.files;
  if (files.length === 0) {
    alert('Please select at least one image file.');
    return;
  }
  
  // Show loading state
  classifyBtn.disabled = true;
  classifyBtn.innerHTML = backendAvailable ? 
    '<span class="spinner"></span>Analyzing with AI...' : 
    '<span class="spinner"></span>Processing...';
  
  resultsSection.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <span>${backendAvailable ? 'Analyzing images with AI classifier...' : 'Processing images with demo classifier...'}</span>
      ${backendAvailable ? '<p style="margin-top: 0.5rem; opacity: 0.7; font-size: 0.9rem;">This may take a few moments...</p>' : ''}
    </div>
  `;

  try {
    const allResults = [];
    let processedCount = 0;

    for (const file of files) {
      try {
        // Validate file
        validateFile(file);
        
        // Create preview URL for the image
        const imageUrl = URL.createObjectURL(file);
        
        let result;
        
        if (backendAvailable) {
          try {
            // Try AI classification first
            console.log(`🤖 Classifying ${file.name} with AI...`);
            result = await classifyImageWithAI(file);
            console.log(`✅ AI result for ${file.name}:`, result);
          } catch (aiError) {
            console.warn(`AI classification failed for ${file.name}:`, aiError.message);
            // Fallback to client-side
            result = classifyImageClientSide(file);
            result.fallback = true;
          }
        } else {
          // Use client-side classification
          await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
          result = classifyImageClientSide(file);
          result.demo = true;
        }
        
        allResults.push({ 
          name: file.name, 
          imageUrl: imageUrl,
          ...result
        });
        
        processedCount++;
        
        // Update loading message with progress
        if (files.length > 1) {
          const progressElement = document.querySelector('.loading span');
          if (progressElement) {
            progressElement.textContent = `Processing... (${processedCount}/${files.length})`;
          }
        }
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        allResults.push({
          name: file.name,
          imageUrl: URL.createObjectURL(file),
          category: 'Error',
          confidence: error.message,
          hasError: true
        });
      }
    }

    // Display results
    displayResults(allResults);
    
  } catch (error) {
    console.error('Classification error:', error);
    resultsSection.innerHTML = `
      <div style="text-align: center; color: #ff6b6b;">
        <p>❌ Error occurred during classification</p>
        <p style="opacity: 0.8; font-size: 0.9rem; margin-top: 0.5rem;">${error.message}</p>
      </div>
    `;
  } finally {
    // Reset button
    classifyBtn.disabled = false;
    classifyBtn.innerHTML = '🚀 Classify Images';
  }
});

function displayResults(results) {
  if (results.length === 0) {
    resultsSection.innerHTML = `
      <div class="empty-state">
        <svg class="upload-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/>
        </svg>
        <p>No results to display</p>
      </div>
    `;
    return;
  }

  // Get classification method info
  const hasAI = results.some(r => !r.demo && !r.fallback && !r.hasError);
  const hasDemo = results.some(r => r.demo);
  const hasFallback = results.some(r => r.fallback);
  
  let methodInfo = '';
  if (hasAI) {
    methodInfo = '🤖 Results from AI Classification (CLIP + ImageNet + OCR)';
  } else if (hasDemo) {
    methodInfo = '📝 Demo Results (Filename-based classification)';
  } else if (hasFallback) {
    methodInfo = '⚠️ Fallback Results (AI unavailable)';
  }

  const resultsHTML = `
    <h3 class="results-title">Classification Results</h3>
    ${methodInfo ? `<p class="method-info" style="text-align: center; margin-bottom: 1rem; opacity: 0.8;">${methodInfo}</p>` : ''}
    <div class="results-grid">
      ${results.map(result => `
        <div class="result-card ${result.hasError ? 'error-card' : ''}">
          <img src="${result.imageUrl}" alt="${result.name}" class="image-preview" onclick="openImageModal('${result.imageUrl}', '${result.name}')">
          <div class="result-info">
            <div class="file-name">${result.name}</div>
            <div class="classification">
              <span class="category ${result.hasError ? 'error-category' : ''}">${result.category || 'Unknown'}</span>
              <span class="confidence ${result.hasError ? 'error-confidence' : ''}">${result.confidence || 'N/A'}</span>
            </div>
            ${result.hasError ? '<p class="error-note">⚠️ Processing failed</p>' : ''}
            ${result.demo ? '<p class="demo-note">📝 Demo classification</p>' : ''}
            ${result.fallback ? '<p class="fallback-note">⚠️ AI fallback</p>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ${hasDemo || hasFallback ? `
      <div class="demo-notice">
        <p>📝 <strong>Note:</strong> ${hasDemo ? 'Demo mode uses filename-based classification.' : 'AI classification failed, using fallback method.'} For best results, ensure the Flask backend is running.</p>
      </div>
    ` : ''}
  `;

  resultsSection.innerHTML = resultsHTML;
}

// Modal functionality for viewing images in full size
function openImageModal(imageUrl, imageName) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  `;
  
  modal.innerHTML = `
    <div style="max-width: 90%; max-height: 90%; position: relative;">
      <img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px;">
      <div style="position: absolute; top: -40px; left: 0; color: white; font-size: 1.1rem; font-weight: 600;">${imageName}</div>
      <div style="position: absolute; top: -40px; right: 0; color: white; font-size: 1.5rem; cursor: pointer;">✕</div>
    </div>
  `;
  
  modal.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.body.appendChild(modal);
}

// Add CSS for new elements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff33;
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .demo-note, .fallback-note {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 0.25rem;
    text-align: center;
  }
  
  .method-info {
    font-size: 0.9rem;
    font-weight: 500;
  }
`;
document.head.appendChild(additionalStyles);

// Clean up object URLs when page unloads to prevent memory leaks
window.addEventListener('beforeunload', () => {
  const images = document.querySelectorAll('.image-preview');
  images.forEach(img => {
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
  });
});