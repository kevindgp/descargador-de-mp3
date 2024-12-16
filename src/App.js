import axios from 'axios';
import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('mp4'); // El formato por defecto es video

  const handleDownload = async () => {
    if (!url) {
      alert("Por favor ingrese una URL de YouTube");
      return;
    }

    // Validar si la URL es de YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      setError('Por favor ingrese una URL válida de YouTube.');
      return;
    }

    setLoading(true);
    setError(null); // Limpiar error previo
    try {
      const response = await axios.post(
        'http://localhost:5000/download',
        { url: url, format: format },
        { responseType: 'blob' }
      );

      const blob = response.data;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      // Asignar nombre dinámico si el servidor envía el título
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : format === 'mp3'
        ? 'audio.mp3'
        : 'video.mp4';

      link.download = filename;
      link.click();

      // Liberar memoria del blob después de usarlo
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(`Error al descargar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>YTDL Downloader</h1>
      <input
        type="text"
        placeholder="Ingresa la URL del video"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div>
        <label>
          <input
            type="radio"
            name="format"
            value="mp4"
            checked={format === 'mp4'}
            onChange={() => setFormat('mp4')}
          />
          Video
        </label>
        <label>
          <input
            type="radio"
            name="format"
            value="mp3"
            checked={format === 'mp3'}
            onChange={() => setFormat('mp3')}
          />
          MP3
        </label>
      </div>
      <button onClick={handleDownload} disabled={loading}>
        {loading ? 'Descargando...' : 'Descargar'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
