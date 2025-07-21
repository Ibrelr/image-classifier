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

    // Maximum file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    // Simple client-side classification based on file characteristics
    function classifyImageClientSide(file) {
      const fileName = file.name.toLowerCase();
      const fileSize = file.size;
      
      // Basic classification rules based on filename and characteristics
      let category = 'Other';
      let confidence = 0.75;

      if (fileName.includes('person') || fileName.includes('people') || fileName.includes('portrait') || fileName.includes('selfie')) {
        category = 'People';
        confidence = 0.85;
      } else if (fileName.includes('food') || fileName.includes('meal') || fileName.includes('restaurant') || fileName.includes('pizza') || fileName.includes('burger')) {
        category = 'Food';
        confidence = 0.80;
      } else if (fileName.includes('cat') || fileName.includes('dog') || fileName.includes('animal') || fileName.includes('pet') || fileName.includes('bird')) {
        category = 'Animals';
        confidence = 0.90;
      } else if (fileName.includes('plant') || fileName.includes('flower') || fileName.includes('tree') || fileName.includes('garden')) {
        category = 'Plants';
        confidence = 0.85;
      } else if (fileName.includes('landscape') || fileName.includes('nature') || fileName.includes('mountain') || fileName.includes('beach') || fileName.includes('forest')) {
        category = 'Nature';
        confidence = 0.80;
      } else if (fileName.includes('building') || fileName.includes('house') || fileName.includes('architecture') || fileName.includes('city')) {
        category = 'Buildings';
        confidence = 0.75;
      } else if (fileName.includes('car') || fileName.includes('vehicle') || fileName.includes('bike') || fileName.includes('truck') || fileName.includes('train')) {
        category = 'Vehicles';
        confidence = 0.85;
      } else {
        // Additional heuristics based on file size and type
        if (fileSize > 3 * 1024 * 1024) { // Large files often landscapes
          category = 'Nature';
          confidence = 0.60;
        } else if (file.type === 'image/png') { // PNGs often graphics/other
          category = 'Other';
          confidence = 0.65;
        } else {
          // Random assignment with lower confidence for demo purposes
          const categories = ['People', 'Food', 'Animals', 'Plants', 'Nature', 'Buildings', 'Vehicles', 'Other'];
          category = categories[Math.floor(Math.random() * categories.length)];
          confidence = 0.45 + Math.random() * 0.3; // 45-75% confidence
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
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      classifyBtn.disabled = true;
      classifyBtn.innerHTML = 'Processing...';
      resultsSection.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <span>Analyzing images with AI...</span>
        </div>
      `;

      try {
        const files = input.files;
        const allResults = [];

        for (const file of files) {
          try {
            // Validate file
            validateFile(file);
            
            // Create preview URL for the image
            const imageUrl = URL.createObjectURL(file);
            
            // Simulate processing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            // Perform client-side classification
            const result = classifyImageClientSide(file);
            
            allResults.push({ 
              name: file.name, 
              imageUrl: imageUrl,
              ...result
            });
            
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

      const resultsHTML = `
        <h3 class="results-title">Classification Results</h3>
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
                ${result.hasError ? '<p class="error-note">⚠️ File validation failed</p>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="demo-notice">
          <p>📝 <strong>Demo Note:</strong> This is a client-side demo using filename-based classification. For real AI classification, use the Flask backend version.</p>
        </div>
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

    // Clean up object URLs when page unloads to prevent memory leaks
    window.addEventListener('beforeunload', () => {
      const images = document.querySelectorAll('.image-preview');
      images.forEach(img => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
      });
    });