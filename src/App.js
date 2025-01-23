import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { saveAs } from 'file-saver';
import './ImageBorderApp.css';

const ImageBorderApp = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [borderColor, setBorderColor] = useState('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Instagram standard aspect ratios
  const INSTAGRAM_RATIOS = {
    square: 1,
    portrait: 4 / 5,
    landscape: 16 / 9
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Reset progress and image states
      setUploadProgress(0);
      setOriginalImage(null);
      setProcessedImage(null);

      const reader = new FileReader();

      // Track reading progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentLoaded = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentLoaded);
        }
      };

      reader.onloadstart = () => {
        setUploadProgress(0);
      };

      reader.onloadend = async () => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          // Complete progress when image is fully loaded
          setUploadProgress(100);
        };
        img.onerror = () => {
          setUploadProgress(0);
          alert('Error loading image. Please try again.');
        };
        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const processImage = (ratio) => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const targetAspectRatio = INSTAGRAM_RATIOS[ratio];
    const originalRatio = originalImage.width / originalImage.height;

    let canvasWidth, canvasHeight;

    // Determine canvas dimensions based on target ratio and original image
    if (originalRatio > targetAspectRatio) {
      // Image is wider than target ratio
      canvasWidth = originalImage.width;
      canvasHeight = canvasWidth / targetAspectRatio;
    } else {
      // Image is taller than target ratio
      canvasHeight = originalImage.height;
      canvasWidth = canvasHeight * targetAspectRatio;
    }

    // Add border width to canvas
    canvas.width = canvasWidth + 2 * borderWidth;
    canvas.height = canvasHeight + 2 * borderWidth;

    // Fill with border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate position to center the original image
    const drawX = (canvas.width - originalImage.width) / 2;
    const drawY = (canvas.height - originalImage.height) / 2;

    // Draw original image
    ctx.drawImage(
      originalImage,
      drawX,
      drawY,
      originalImage.width,
      originalImage.height
    );

    // Convert to high-quality PNG
    const processedDataUrl = canvas.toDataURL('image/png');
    setProcessedImage(processedDataUrl);
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'instagram_bordered_image.png';
      link.click();
    }
  };

  return (
    <div className="instagram-border-container">
      <h1>Instagram Image Border Tool</h1>

      <div className="app-layout">
        <div className="controls-section">
          <div className="file-upload-container">
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="file-input"
            />

            {uploadProgress > 0 && (
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className="progress-text">
                  {uploadProgress}% Loaded
                </span>
              </div>
            )}
          </div>

          <div className="color-picker-container">
            <label>Border Color</label>
            <SketchPicker
              color={borderColor}
              onChangeComplete={(color) => setBorderColor(color.hex)}
            />
          </div>

          <div className="border-width-container">
            <label>Border Width (pixels)</label>
            <input
              type="number"
              value={borderWidth}
              onChange={(e) => setBorderWidth(Number(e.target.value))}
              min="10"
              max="200"
            />
          </div>

          <div className="ratio-buttons">
            <button
              onClick={() => processImage('square')}
              className="square-ratio"
            >
              Square (1:1)
            </button>
            <button
              onClick={() => processImage('portrait')}
              className="portrait-ratio"
            >
              Portrait (4:5)
            </button>
            <button
              onClick={() => processImage('landscape')}
              className="landscape-ratio"
            >
              Landscape (16:9)
            </button>
          </div>
        </div>

        <div className="preview-section">
          {processedImage && (
            <div className="processed-image-container">
              <h2>Processed Image</h2>
              <img
                src={processedImage}
                alt="Processed"
                className="processed-image"
              />
              <button
                onClick={downloadImage}
                className="download-button"
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBorderApp;