// Initialize particles with inline config instead of loading external file
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
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
            enable: true,
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

    // Update file input label when files are selected
    input.addEventListener('change', function() {
      const label = document.querySelector('.file-input-label');
      const fileCount = this.files.length;
      if (fileCount > 0) {
        label.innerHTML = `
          <svg class="file-input-icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          ${fileCount} image${fileCount > 1 ? 's' : ''} selected
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
          // Create preview URL for the image
          const imageUrl = URL.createObjectURL(file);
          
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch('/classify', {
            method: 'POST',
            body: formData
          });
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          allResults.push({ 
            name: file.name, 
            imageUrl: imageUrl,
            ...data 
          });
        }

        // Display results
        displayResults(allResults);
        
      } catch (error) {
        console.error('Classification error:', error);
        resultsSection.innerHTML = `
          <div style="text-align: center; color: #ff6b6b;">
            <p>❌ Error occurred during classification</p>
            <p style="opacity: 0.8; font-size: 0.9rem; margin-top: 0.5rem;">Please try again or check your connection</p>
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
            <p>No results to display</p>
          </div>
        `;
        return;
      }

      const resultsHTML = `
        <h3 class="results-title">Classification Results</h3>
        <div class="results-grid">
          ${results.map(result => `
            <div class="result-card">
              <img src="${result.imageUrl}" alt="${result.name}" class="image-preview" onclick="openImageModal('${result.imageUrl}', '${result.name}')">
              <div class="result-info">
                <div class="file-name">${result.name}</div>
                <div class="classification">
                  <span class="category">${result.category || 'Unknown'}</span>
                  <span class="confidence">${result.confidence || 'N/A'}</span>
                </div>
              </div>
            </div>
          `).join('')}
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