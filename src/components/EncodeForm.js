import React from 'react';
import UPNG from 'upng-js';
import ImageUploadBox from './ImageUploadBox';
import ImageDisplayBox from './ImageDisplayBox';
import './EncodeForm.css';
import { encodeWithSSS } from '../encodeWithSSS';
const EncodeForm = ({ hidingBitNumber, setHidingBitNumber }) => {
  // Örnek resim URL'leri
  const sampleImage1 = 'https://via.placeholder.com/150/0000FF/FFFFFF?Text=ÖrnekResim1';
  const sampleImage2 = 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=ÖrnekResim2';

  // İndirme fonksiyonu (örnek)
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

  // Bu state'ler daha sonra yüklenen/işlenen resimlerin URL'lerini tutacak
  // Şimdilik placeholder veya null kullanıyoruz
  const [uploadedImage1, setUploadedImage1] = React.useState(null);
  const [uploadedImage2, setUploadedImage2] = React.useState(null);
  //const [hidingBitNumber, setHidingBitNumber] = React.useState(2); // Varsayılan olarak 2 bit

  const [renderedImagesPart2, setRenderedImagesPart2] = React.useState(Array(6).fill(null));
  const [renderedImagesPart3, setRenderedImagesPart3] = React.useState(Array(6).fill(null));
  const encodedPixelsArr = React.useRef([[], [], [], [], [], []]);

  function increaseResolution(Array, width, height) {
    const newWidth = width * 2;
    const newHeight = height * 2;
    const newPixels = new Uint8Array(newWidth * newHeight * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Orijinal pikselin RGBA değerleri
        const idx = (y * width + x) * 4;
        const r = Array[idx];
        const g = Array[idx + 1];
        const b = Array[idx + 2];
        const a = Array[idx + 3];

        // 2x2 blok doldur
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const nx = x * 2 + dx;
            const ny = y * 2 + dy;
            const nidx = (ny * newWidth + nx) * 4;
            newPixels[nidx] = r;
            newPixels[nidx + 1] = g;
            newPixels[nidx + 2] = b;
            newPixels[nidx + 3] = a;
          }
        }
      }
    }
    return newPixels;
  }

  const splitBits = (encodedBinaryPixels, hidingBitNumber) => {
    return encodedBinaryPixels.flatMap(byte => {
      const grubs = [];
      for (let i = 0; i < 8; i += hidingBitNumber){
        grubs.push(byte.substr(i, hidingBitNumber));
      }
      return grubs;
    });
  }

  

  function hideImage(newPixels,hidingBitNumber,img) {
    const encodedBinaryPixels = Array.from(encodedPixelsArr.current[img], byte =>
      byte.toString(2).padStart(8, '0')
    );
    const BitGroups = splitBits(encodedBinaryPixels, hidingBitNumber);
    /*const BitGroups = encodedBinaryPixels.flatMap(byte => 
      [byte.substr(0, 2), byte.substr(2, 2), byte.substr(4, 2), byte.substr(6, 2)]
    );*/
    let groupIndex = 0;
    for (let i = 0; i < newPixels.length; i += 4) {
      for (let c = 0; c < 4; c++) {
        if (groupIndex < BitGroups.length) {
          // 1. Önce orijinal pikselin son 2 bitini temizle (0 yap)
          const createMask = (hidingBitNumber) => {
            return ~((1 << hidingBitNumber) - 1) & 0xFF;
          };
          newPixels[i + c] = newPixels[i + c] & createMask(hidingBitNumber); // AND ile son 2 biti sil
          // 2. twoBitGroups'taki 2-bit değerini ekle (OR ile birleştir)
          newPixels[i + c] = newPixels[i + c] | parseInt(BitGroups[groupIndex],2);
          groupIndex++;
        }
      }
    }
    const imgNumber =(img+1).toString(2).padStart(3,'0');
    newPixels[3] = newPixels[3] & 0b11111000;
    newPixels[3] = newPixels[3] | imgNumber;

    return newPixels;
  }

  const handleClick = (file) => {
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
      const rawPixels = new Uint8Array(UPNG.toRGBA8(png)[0]);
      const width =png.width;
      const height =png.height;


    // 6 farklı encoded pixel array
    for (let i = 0; i < rawPixels.length; i++) {
        const encoded = encodeWithSSS(rawPixels[i]);
        encodedPixelsArr.current[0].push(encoded[1]);
        encodedPixelsArr.current[1].push(encoded[3]);
        encodedPixelsArr.current[2].push(encoded[5]);
        encodedPixelsArr.current[3].push(encoded[7]);
        encodedPixelsArr.current[4].push(encoded[9]);
        encodedPixelsArr.current[5].push(encoded[11]);
    }
  
  const rendered2 = [];
  for (let k = 0; k < 6; k++) {
    // RGBA formatına dönüştür (her piksel için 4 kanal)
    const rgba = new Uint8Array(width * height * 4);
    for (let i = 0; i < encodedPixelsArr.current[k].length; i+=4) {
      // Sadece gri tonlama için R,G,B aynı, alpha 255
      rgba[i] = encodedPixelsArr.current[k][i];
      rgba[i+1] = encodedPixelsArr.current[k][i+1];
      rgba[i+2] = encodedPixelsArr.current[k][i+2];
      rgba[i+3] = 255;
    }
    //console.log('not alha',rgba);
    const pngData = UPNG.encode([rgba.buffer], width, height, 0);
    const url = URL.createObjectURL(new Blob([pngData], { type: "image/png" }));
    rendered2.push(url);
    // İsterseniz farklı işleyebilirsiniz
  }
  setRenderedImagesPart2(rendered2);
}
  reader.onerror = (error) => {
    console.error('Dosya okuma hatası:', error);
  };
  reader.readAsArrayBuffer(file);
  }

  const handeHideImage =(file)=>{
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
      const height =png.height;
      const rawPixels = new Uint8Array(UPNG.toRGBA8(png)[0]);
      //console.log('hide:',rawPixels);

      // Çözünürlüğü 2x artır (4 kat piksel)
      const newPixels = increaseResolution(rawPixels, width, height);
      // height ve width'i düzenlenecek
      const newWidth = width * 2;
      const newHeight = height * 2;
    
      const rendered3=[];
      for (let img=0;img<6;img++){
        const codedPixels = hideImage(newPixels,hidingBitNumber,img);
        const upscaledPng1 = UPNG.encode([codedPixels.buffer], newWidth, newHeight, 0);
        const upscaledUrl2 = URL.createObjectURL(new Blob([upscaledPng1], { type: "image/png" }));
        rendered3.push(upscaledUrl2);
      }
      setRenderedImagesPart3(rendered3);
    }
    reader.onerror = (error) => {
      console.error('Dosya okuma hatası:', error);
    };
    reader.readAsArrayBuffer(file);
  }


  return (
    <div className="encode-form">
      {/* 3. Parça (Sol) - Renderlanmış Resimler ve İndirme Butonları */}
      <div className="encode-section section-render-download">
        <h3>İşlenmiş Resimler</h3>
        {renderedImagesPart3.map((imgSrc, index) => (
          <div key={`part3-img-${index}`} className="image-render-item">
            <ImageDisplayBox
              imageSrc={imgSrc || `https://via.placeholder.com/100/CCCCCC/FFFFFF?Text=Resim${index + 1}`}
              altText={`İşlenmiş Resim ${index + 1}`}
            />
            <button
              onClick={() => handleDownload(imgSrc, `processed_image_${index + 1}.png`)}
              className="download-button"
              disabled={!imgSrc}
            >
              İndir
            </button>
          </div>
        ))}
      </div>

      {/* 2. Parça (Orta) - Renderlanmış Resimler */}
      <div className="encode-section section-render-only">
        <h3>İşlenecek Resimler</h3>
        {renderedImagesPart2.map((imgSrc, index) => (
          <ImageDisplayBox
            key={`part2-img-${index}`}
            imageSrc={imgSrc || `https://via.placeholder.com/100/777777/FFFFFF?Text=Alan${index + 1}`}
            altText={`Render Alanı ${index + 1}`}
          />
        ))}
      </div>

      {/* 1. Parça (Sağ) - Resim Yükleme */}
      <div className="encode-section section-upload">
        <h3>Kaynak Resimler</h3>
        <input type="number"
          placeholder="ipxelin kaç bitine gömmek istersiniz?"
          value={hidingBitNumber}
          onChange={(e) => setHidingBitNumber(e.target.value)}
        />
        <div className="upload-boxes-container">
          <ImageUploadBox
            sampleImage={sampleImage1}
            onImageUpload={(file) => {
              handleClick(file);
              // Burada dosyayı işleyip URL'ini setUploadedImage1 ile ayarlayabilirsiniz
              if (file) setUploadedImage1(URL.createObjectURL(file));
              else setUploadedImage1(null);
            }}
            label="Ana Resim"
          />
          <ImageUploadBox
            sampleImage={sampleImage2}
            onImageUpload={(file) => {
              handeHideImage(file);
              if (file) setUploadedImage2(URL.createObjectURL(file));
              else setUploadedImage2(null);
            }}
            label="Gizlenecek Resim"
          />
        </div>
      </div>
    </div>
  );
};

export default EncodeForm;