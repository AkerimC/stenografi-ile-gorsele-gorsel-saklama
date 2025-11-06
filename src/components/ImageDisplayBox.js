import React from 'react';
import './ImageDisplayBox.css';

const ImageDisplayBox = ({ imageSrc, altText = "Görüntülenen Resim", className = "" }) => {
  return (
    <div className={`image-display-box ${className}`}>
      {imageSrc ? (
        <img src={imageSrc} alt={altText} className="displayed-image" />
      ) : (
        <div className="display-placeholder">
          <span>{altText}</span>
        </div>
      )}
    </div>
  );
};

export default ImageDisplayBox;