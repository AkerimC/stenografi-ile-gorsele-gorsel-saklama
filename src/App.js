import React, { useState } from 'react';
import EncodeForm from './components/EncodeForm';
import DecodeForm from './components/DecodeForm';
import PsnrForm from './components/PsnrForm';
import './App.css';

function App() {
  const [mode, setMode] = useState('encode'); // 'encode', 'decode', 'psnr'
  const [hidingBitNumber, setHidingBitNumber] = useState(2); // Varsayılan olarak 2 bit

  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={() => setMode('encode')}
          className="mode-toggle-button"
          disabled={mode === 'encode'}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className="mode-toggle-button"
          disabled={mode === 'decode'}
        >
          Decode
        </button>
        <button
          onClick={() => setMode('psnr')}
          className="mode-toggle-button"
          disabled={mode === 'psnr'}
        >
          PSNR Hesaplama
        </button>
      </header>
      <main className="App-main">
        {mode === 'encode' && (
          <EncodeForm
        hidingBitNumber={hidingBitNumber}
        setHidingBitNumber={setHidingBitNumber}
        />)}
        {mode === 'decode' && (
          <DecodeForm
          hidingBitNumber={hidingBitNumber}
          />)}
        {mode === 'psnr' && <PsnrForm />}
      </main>
    </div>
  );
}

export default App;