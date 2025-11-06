import React, { useState, useRef } from 'react';
import './ImageUploadBox.css';

const ImageUploadBox = ({ sampleImage, onImageUpload, label = "Resim Yükle" }) => {
  const [preview, setPreview] = useState(sampleImage || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onImageUpload) {
          onImageUpload(file); // Dosyanın kendisini üst bileşene gönder
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(sampleImage || null); // Dosya seçilmezse veya temizlenirse örneğe dön
      if (onImageUpload) {
        onImageUpload(null);
      }
    }
  };

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-upload-box" onClick={handleBoxClick}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      {preview ? (
        <img src={preview} alt={label} className="image-preview" />
      ) : (
        <div className="upload-placeholder">
          <span>{label}</span>
          <small>(Tıkla veya sürükle)</small>
        </div>
      )}
    </div>
  );
};

export default ImageUploadBox;