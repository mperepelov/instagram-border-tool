import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import './ImageBorderApp.css';

const ImageBorderApp = () => {
  // State management for image processing
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  // Border customization states
  const [borderColor, setBorderColor] = useState('#FFFFFF');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [gradientColors, setGradientColors] = useState({
    color1: '#FFFFFF',
    color2: '#000000'
  });
  const [borderWidth, setBorderWidth] = useState(0);

  // File input reference
  const fileInputRef = useRef(null);

  // Instagram standard aspect ratios
  const INSTAGRAM_RATIOS = {
    square: 1,
    portrait: 4 / 5,
    landscape: 16 / 9
  };

  // Available border style options
  const BORDER_STYLES = [
    'solid',
    'gradient-linear',
    'gradient-radial',
    'gradient-diagonal'
  ];

  // Create dynamic border fill based on selected style
  const createBorderFill = (ctx, width, height) => {
    switch (borderStyle) {
      case 'solid':
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'gradient-linear':
        const linearGradient = ctx.createLinearGradient(0, 0, width, 0);
        linearGradient.addColorStop(0, gradientColors.color1);
        linearGradient.addColorStop(1, gradientColors.color2);
        ctx.fillStyle = linearGradient;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'gradient-radial':
        const radialGradient = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height)
        );
        radialGradient.addColorStop(0, gradientColors.color1);
        radialGradient.addColorStop(1, gradientColors.color2);
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'gradient-diagonal':
        const diagonalGradient = ctx.createLinearGradient(0, 0, width, height);
        diagonalGradient.addColorStop(0, gradientColors.color1);
        diagonalGradient.addColorStop(1, gradientColors.color2);
        ctx.fillStyle = diagonalGradient;
        ctx.fillRect(0, 0, width, height);
        break;

      default:
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, width, height);
    }
  };

  // Handle image file upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload a JPG or PNG image');
        return;
      }

      // Read file
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
        };
        img.onerror = () => {
          alert('Error loading image. Please try a different file.');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image to desired aspect ratio
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

    // Create dynamic border fill
    createBorderFill(ctx, canvas.width, canvas.height);

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

  // Download processed image
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
          </div>

          <div className="color-controls">
            <div className="border-style-selector">
              <label>Border Style</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
              >
                {BORDER_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {borderStyle === 'solid' && (
              <div className="solid-color-picker">
                <label>Solid Border Color</label>
                <SketchPicker
                  color={borderColor}
                  onChangeComplete={(color) => setBorderColor(color.hex)}
                />
              </div>
            )}

            {borderStyle.includes('gradient') && (
              <div className="gradient-color-pickers">
                <div className="gradient-color-picker">
                  <label>First Gradient Color</label>
                  <SketchPicker
                    color={gradientColors.color1}
                    onChangeComplete={(color) =>
                      setGradientColors(prev => ({ ...prev, color1: color.hex }))
                    }
                  />
                </div>
                <div className="gradient-color-picker">
                  <label>Second Gradient Color</label>
                  <SketchPicker
                    color={gradientColors.color2}
                    onChangeComplete={(color) =>
                      setGradientColors(prev => ({ ...prev, color2: color.hex }))
                    }
                  />
                </div>
              </div>
            )}

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
          </div>

          <div className="ratio-buttons">
            <button
              onClick={() => processImage('square')}
              className="square-ratio"
              disabled={!originalImage}
            >
              Square (1:1)
            </button>
            <button
              onClick={() => processImage('portrait')}
              className="portrait-ratio"
              disabled={!originalImage}
            >
              Portrait (4:5)
            </button>
            <button
              onClick={() => processImage('landscape')}
              className="landscape-ratio"
              disabled={!originalImage}
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