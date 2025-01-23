import React, { useState, useRef } from 'react';
import { SketchPicker } from 'react-color';
import { saveAs } from 'file-saver';
import './ImageBorderApp.css';

const ImageBorderApp = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [borderColor, setBorderColor] = useState('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState(50);
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
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

    let canvasWidth, canvasHeight, drawX, drawY, drawWidth, drawHeight;

    if (originalRatio > targetAspectRatio) {
      // Image is wider than target ratio
      canvasHeight = originalImage.height;
      canvasWidth = canvasHeight * targetAspectRatio;
      drawX = (canvasWidth - originalImage.width) / 2;
      drawY = 0;
      drawWidth = originalImage.width;
      drawHeight = originalImage.height;
    } else {
      // Image is taller than target ratio
      canvasWidth = originalImage.width;
      canvasHeight = canvasWidth / targetAspectRatio;
      drawX = 0;
      drawY = (canvasHeight - originalImage.height) / 2;
      drawWidth = originalImage.width;
      drawHeight = originalImage.height;
    }

    // Set canvas size
    canvas.width = canvasWidth + 2 * borderWidth;
    canvas.height = canvasHeight + 2 * borderWidth;

    // Fill with border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    ctx.drawImage(
      originalImage,
      drawX + borderWidth,
      drawY + borderWidth,
      drawWidth,
      drawHeight
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
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            ref={fileInputRef}
          />

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