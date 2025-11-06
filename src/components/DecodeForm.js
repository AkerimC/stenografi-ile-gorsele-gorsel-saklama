import React, { useRef, useState } from 'react';
import UPNG from 'upng-js';
import ImageUploadBox from './ImageUploadBox';
import ImageDisplayBox from './ImageDisplayBox';
import './DecodeForm.css';
import { decodeWithSSS } from '../encodeWithSSS';


const DecodeForm = ({hidingBitNumber}) => {
  const [inputImage1, setInputImage1] = useState(null);
  const [inputImage2, setInputImage2] = useState(null);
  const [inputImage3, setInputImage3] = useState(null);
  const [decodedImage, setDecodedImage] = useState(null); // Tek sonuç resmi
  
  const [orgWidth,setWidth]=useState(null);
  const [orgHeight,setHeight]=useState(null);
  const pixelArr = React.useRef([])

  const handleDownload = (imageSrc, imageName = 'encoded-image.png') => {
    if (!imageSrc) {
      alert('İndirilecek resim bulunamadı!');
      return;
    }
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImage =(file)=>{
    if (!file) {
      console.error("Dosya seçilmedi!");
      return;
    } 
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target?.result) return;
      const arrayBuffer = e.target.result;
      // PNG'yi çözümle
      
      const png = UPNG.decode(arrayBuffer);
      const width =png.width;
      setWidth(width);
      const height =png.height;
      setHeight(height);
      const rawPixels = new Uint8Array(UPNG.toRGBA8(png)[0]);
      const newImage= [[],[]];
      const Pixel =[];
      
      const imageNumber = rawPixels[3] & 0b00000111;

      newImage[0].push(imageNumber);
      const createMask = (bit) => {
        return (1 << bit) - 1;
      }
      const createMaskResidual = (bit) => {
        return (1 << bit) - 1;
      }
      const grub = Math.ceil(8 / hidingBitNumber);
      let residual = 8 % hidingBitNumber;

      for(let i=0;i<rawPixels.length;i+=grub){
        for(let c=0;c<grub-1;c++){
          Pixel.push(rawPixels[i+c]&createMask(hidingBitNumber));
        }
        Pixel.push(rawPixels[i+grub-1]&createMaskResidual(residual===0?hidingBitNumber:residual));
        
      let newPixel = 0;
      let currentShift = 8; // 8 bitten geriye doğru saymaya başla

      for (let c = 0; c < grub; c++) {
        let bitsToPack; // Bu döngüde kaç bit paketlenecek?

        if (c === grub - 1 && residual !== 0) {
          // Bu son grup ve kalan (residual) var
          bitsToPack = residual;
        } else {
          // Bu normal bir grup
          bitsToPack = hidingBitNumber;
        }

        // Önce shift miktarını azalt, sonra uygula
        currentShift -= bitsToPack; 
        
        newPixel |= Pixel[c] << currentShift;
      }

      newImage[1].push(newPixel);
      Pixel.splice(0, grub);

      }



      pixelArr.current.push(newImage);
      //console.log('raw',Array.from(rawPixels,byte =>byte.toString(2).padStart(8,'0')));

      const rgba = new Uint8Array((width/2) * (height/2) * 4);
      //console.log('hexwi', height/2,width/2);
      
      for (let i = 0; i < pixelArr.current[0][1].length ; i++) {
        rgba[i] = pixelArr.current[0][1][i];
      }
      /*console.log('rgba: ',Array.from(rgba,byte=>byte.toString(2).padStart(8,'0')));
      //gömülmemiş hali gömülmüşle aynı
      const pngData = UPNG.encode([rgba.buffer], width/2, height/2, 0);
      const blob = new Blob([pngData], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setDecodedImage(url);*/

    }
    reader.onerror = (error) => {
      console.error('Dosya okuma hatası:', error);
    };
    reader.readAsArrayBuffer(file);
  }


  // Gerçek decode işlemi burada tetiklenmeli
  const handleDecode = () => {
    // Örnek: Eğer tüm inputlar varsa decode edilmiş resmi göster
    if (inputImage1 && inputImage2 && inputImage3) {
      // Bu kısım gerçek decode mantığını içermelidir.
      // Şimdilik ilk resmi sonuç olarak gösterelim.
      setDecodedImage(inputImage1);
      const width=orgWidth;
      const height=orgHeight;
      const finalImage=decodeWithSSS(pixelArr.current);
      const rgba = new Uint8Array((width/2) * (height/2) * 4);
      //console.log('hexwi', height/2,width/2);
      for (let i = 0; i < finalImage.length; i += 4) {
        rgba[i] = finalImage[i];       // R
        rgba[i + 1] = finalImage[i+1]; // G
        rgba[i + 2] = finalImage[i+2]; // B
        rgba[i + 3] = finalImage[i+3];             // A (tam opak)
      }
      //console.log('rgba: ',Array.from(rgba,byte=>byte.toString(2).padStart(8,'0')));
      //gömülmemiş hali gömülmüşle aynı
      const pngData = UPNG.encode([rgba.buffer], width/2, height/2, 0);
      const blob = new Blob([pngData], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setDecodedImage(url);

      //alert('Decode işlemi (simülasyon) tamamlandı!');
    } else {
      alert('Lütfen decode için 3 resmi de yükleyin.');
    }
  };


  return (
    <div className="decode-form">
      {/* 1. Parça - Resim Inputları */}
      <div className="decode-section section-inputs">
        <h3>Decode Edilecek Resimler</h3>
        <div className="decode-input-grid">
          <ImageUploadBox
            label="Resim 1"
            onImageUpload={(file) => {handleImage(file);
              setInputImage1(file ? URL.createObjectURL(file) : null)}}
          />
          <ImageUploadBox
            label="Resim 2"
            onImageUpload={(file) => {handleImage(file);
              setInputImage2(file ? URL.createObjectURL(file) : null)}}
          />
          <ImageUploadBox
            label="Resim 3"
            onImageUpload={(file) => {handleImage(file);
              setInputImage3(file ? URL.createObjectURL(file) : null)}}
          />
        </div>
        <button onClick={handleDecode} className="decode-action-button">
          Decode Et
        </button>
      </div>

      {/* 2. Parça - Tek Resim Kutucuğu (Sonuç) */}
      <div className="decode-section section-output">
        <h3>Decode Edilmiş Resim</h3>
        <ImageDisplayBox
          imageSrc={decodedImage || 'https://via.placeholder.com/250/DDDDDD/000000?Text=SonuçBurada'}
          altText="Decode Edilmiş Sonuç"
          className="decoded-image-display"
        />
        <button
          onClick={() => handleDownload(decodedImage, `decoded_image.png`)}
          className="download-button"
          disabled={!decodedImage}
        >
          İndir
        </button>
      </div>
    </div>
  );
};

export default DecodeForm;