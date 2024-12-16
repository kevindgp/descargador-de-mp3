const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();
const rateLimit = require('express-rate-limit');

// Habilitar CORS y parsear solicitudes JSON
app.use(cors());
app.use(express.json());

// Limitar solicitudes para evitar abuso
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 solicitudes por minuto
  message: 'Demasiadas solicitudes, por favor intente nuevamente más tarde.',
});
app.use(limiter);

app.post('/download', async (req, res) => {
  const { url, format } = req.body;

  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    // Verifica si la URL es válida
    if (!ytdl.validateURL(url)) {
      return res.status(400).send('URL no válida');
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitizar nombre del archivo

    if (format === 'mp3') {
      // Si el formato es mp3, extraemos el audio
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      ytdl(url, { filter: 'audioonly' }).pipe(res);
    } else if (format === 'mp4') {
      // Si el formato es video
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      ytdl(url, { filter: 'videoandaudio' }).pipe(res);
    } else {
      return res.status(400).send('Formato no soportado');
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).send('Error al procesar la solicitud');
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
