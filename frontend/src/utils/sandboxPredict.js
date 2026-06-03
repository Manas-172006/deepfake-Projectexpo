/**
 * sandboxPredict.js — FakeProof Labs
 * Generates high-fidelity mock predictions and programmatically draws
 * synthetic Grad-CAM heatmaps & overlays from the uploaded image.
 */

// Helper to load image onto an HTML Image object
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

/**
 * Simulates a full forensic pipeline and outputs a result structure identical to FastAPI.
 * @param {File} file
 * @param {string} fileDataUrl - the base64 URL of the input image
 * @returns {Promise<object>} response payload matching backend structure
 */
export const runSandboxPrediction = async (file, fileDataUrl) => {
  // 1. Generate prediction variables
  const isFake = Math.random() < 0.65; // 65% fake, 35% real (for demo effectiveness)
  const confidence = parseFloat((84 + Math.random() * 14.5).toFixed(1)); // 84.0% - 98.5%
  const processingTime = Math.floor(480 + Math.random() * 350); // 480ms - 830ms
  const gradcamScore = Math.floor(72 + Math.random() * 23); // 72 - 95 attention score

  const verdict = isFake ? 'Fake' : 'Real';
  
  // High-quality professional analysis texts
  const aiAnalysis = isFake
    ? `CNN authentic-scan detected statistical anomalies in the local texture gradients of the primary facial region. High-frequency noise residual analysis reveals irregularities consistent with GAN (Generative Adversarial Network) upsampling and spatial interpolation. Grad-CAM explainability mappings identify peak neural attention localized around high-gradient boundaries (eyes, nose, and mouth contours) where synthetic blending artifacts are most prominent. The FPL-Classifier estimates a confidence level of ${confidence}% that this media has been altered or synthesized.`
    : `Authenticity analysis completed. The convolutional scan shows no significant anomalies in the high-frequency pixel distributions or texture boundaries. Noise spectral patterns are uniform across the entire image field, matching standard digital camera sensor profiles. Grad-CAM visualizer mapped a diffuse neural attention spread with no localized suspicious feature focus, indicating a natural face-to-background transition. Authentication confidence is high at ${confidence}%, indicating that this is a genuine photographic capture.`;

  // 2. Programmatically generate heatmap and overlay using Canvas
  let originalB64 = '';
  let heatmapB64 = '';
  let overlayB64 = '';

  try {
    const img = await loadImage(fileDataUrl);
    
    // Create standard size canvas (matching model 224x224 or a clean box ratio)
    const size = 320;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Original image scaled/cropped to square
    ctx.drawImage(img, 0, 0, size, size);
    originalB64 = canvas.toDataURL('image/png').split(',')[1];

    // 2. Heatmap Canvas
    const hmCanvas = document.createElement('canvas');
    hmCanvas.width = size;
    hmCanvas.height = size;
    const hmCtx = hmCanvas.getContext('2d');
    
    // Draw black background
    hmCtx.fillStyle = '#000000';
    hmCtx.fillRect(0, 0, size, size);

    // Draw some random spots representing attention hotspots (jet color map)
    const hotspots = [];
    if (isFake) {
      // Focus on mouth/eyes areas
      hotspots.push({ x: size * 0.5, y: size * 0.45, r: size * 0.35, color1: 'rgba(255, 0, 0, 0.7)', color2: 'rgba(255, 255, 0, 0.3)' });
      hotspots.push({ x: size * 0.35, y: size * 0.38, r: size * 0.2, color1: 'rgba(255, 0, 0, 0.6)', color2: 'rgba(0, 255, 0, 0.2)' });
      hotspots.push({ x: size * 0.65, y: size * 0.38, r: size * 0.2, color1: 'rgba(255, 0, 0, 0.6)', color2: 'rgba(0, 255, 0, 0.2)' });
    } else {
      // Diffuse focus
      hotspots.push({ x: size * 0.5, y: size * 0.5, r: size * 0.45, color1: 'rgba(0, 255, 0, 0.4)', color2: 'rgba(0, 0, 255, 0.1)' });
    }

    hotspots.forEach((h) => {
      const grad = hmCtx.createRadialGradient(h.x, h.y, h.r * 0.1, h.x, h.y, h.r);
      grad.addColorStop(0, h.color1);
      grad.addColorStop(0.5, h.color2);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      hmCtx.beginPath();
      hmCtx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      hmCtx.fillStyle = grad;
      hmCtx.fill();
    });

    // Extract raw base64 heatmap
    heatmapB64 = hmCanvas.toDataURL('image/png').split(',')[1];

    // 3. Overlay Canvas (Original image + Heatmap blended)
    const ovCanvas = document.createElement('canvas');
    ovCanvas.width = size;
    ovCanvas.height = size;
    const ovCtx = ovCanvas.getContext('2d');

    // Draw original image
    ovCtx.drawImage(img, 0, 0, size, size);
    
    // Draw heatmap on top with destination-over or standard alpha blending
    ovCtx.globalAlpha = 0.45;
    ovCtx.drawImage(hmCanvas, 0, 0, size, size);
    ovCtx.globalAlpha = 1.0;
    
    overlayB64 = ovCanvas.toDataURL('image/png').split(',')[1];
  } catch (err) {
    console.error('Failed to generate mock Grad-CAM images programmatically:', err);
    // Simple fallback to original if image fails loading
    const rawB64 = fileDataUrl.split(',')[1] || '';
    originalB64 = rawB64;
    heatmapB64 = rawB64;
    overlayB64 = rawB64;
  }

  return {
    prediction: verdict,
    confidence: confidence,
    processing_time: processingTime,
    ai_analysis: aiAnalysis,
    gemini_powered: false,
    gradcam_score: gradcamScore,
    heatmap_image: heatmapB64,
    overlay_image: overlayB64,
    original_image: originalB64,
    status: 'success',
    sandbox: true // Flag to show it is running in sandbox mode
  };
};
