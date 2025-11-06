import React from 'react';
import UPNG from 'upng-js';
import ImageUploadBox from './ImageUploadBox';
import './PsnrForm.css';

const PsnrForm = () => {
  const sampleImage1 = 'https://via.placeholder.com/150/0000FF/FFFFFF?Text=ÖrnekResim1';
  const sampleImage2 = 'https://via.placeholder.com/150/FF0000/FFFFFF?Text=ÖrnekResim2';
  const [uploadedFile1, setUploadedFile1] = React.useState(null);
  const [uploadedFile2, setUploadedFile2] = React.useState(null);
  const [psnrValue, setPsnrValue] = React.useState(null); // PSNR state'i eklendi

  const calculatePSNR = (file1 , file2) => {
    if (!file1 || !file2) {
      console.error("Dosya seçilmedi!");
      setPsnrValue(null);
      return;
    }
    const reader1 = new FileReader();
    const reader2 = new FileReader();

    reader1.onload = (e) => {
      if (!e.target?.result) return;
      const arrayBuffer1 = e.target.result;
      const png1 = UPNG.decode(arrayBuffer1);
      const rawPixels1 = new Uint8Array(UPNG.toRGBA8(png1)[0]);

      reader2.onload = (e2) => {
        if (!e2.target?.result) return;
        const arrayBuffer2 = e2.target.result;
        const png2 = UPNG.decode(arrayBuffer2);
        const rawPixels2 = new Uint8Array(UPNG.toRGBA8(png2)[0]);

        if (rawPixels1.length !== rawPixels2.length) {
          console.error("Resimler aynı boyutta değil!");
          setPsnrValue("Resimler aynı boyutta değil!");
          return;
        }

        let mse = 0;
        for (let i = 0; i < rawPixels1.length; i++) {
          mse += Math.pow(rawPixels1[i] - rawPixels2[i], 2);
        }
        mse /= rawPixels1.length;

        if (mse === 0) {
          setPsnrValue("Sonsuz (resimler tamamen aynı)");
          return;
        }

        const psnr = 20 * Math.log10(255 / Math.sqrt(mse));
        setPsnrValue(`${psnr.toFixed(2)} dB`);
      };

      reader2.readAsArrayBuffer(file2);
    };

    reader1.readAsArrayBuffer(file1); 
  };

  return (
    <div className="psnr-form">
      <h2>PSNR Hesaplama Sayfası</h2>
      {psnrValue && (
        <h3>PSNR: {psnrValue}</h3>
      )}
      <div className="upload-boxes-container">
        <ImageUploadBox
          sampleImage={sampleImage1}
          onImageUpload={(file) => {
            if (file) {
              setUploadedFile1(file);
            } else {
              setUploadedFile1(null);
            }
          }}
          label="Ana Resim"
        />
        <ImageUploadBox
          sampleImage={sampleImage2}
          onImageUpload={(file) => {
            if (file) {
              setUploadedFile2(file);
            } else {
              setUploadedFile2(null);
            }
          }}
          label="Gizlenecek Resim"
        />
        <button onClick={() => {calculatePSNR(uploadedFile1, uploadedFile2);}}> Hesapla</button>
      </div>
    </div>
  );
};

export default PsnrForm;