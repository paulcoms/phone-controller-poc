import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import os from 'os';

const app = express();
app.use(express.static('public'));
app.get('/', (_req,res)=>res.redirect('/world.html'));

// Phone posts the recorded audio here. Keep the OpenAI key on the server only.
app.post('/transcribe', express.raw({ type: ['audio/*', 'application/octet-stream'], limit: '15mb' }), async (req, res) => {
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not set on the server.' });
  if (!req.body?.length) return res.status(400).json({ error: 'No audio received.' });

  try {
    const contentType = req.headers['content-type'] || 'audio/webm';
    const ext = contentType.includes('mp4') ? 'mp4' : contentType.includes('ogg') ? 'ogg' : contentType.includes('wav') ? 'wav' : 'webm';
    const form = new FormData();
    form.append('model', 'gpt-4o-mini-transcribe');
    form.append('file', new Blob([req.body], { type: contentType }), `speech.${ext}`);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Transcription failed.' });
    const text = (data.text || '').trim();
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Transcription failed.' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({server});
function broadcast(sender, data) {
  for (const client of wss.clients) if (client !== sender && client.readyState === WebSocket.OPEN) client.send(data);
}
wss.on('connection', ws => ws.on('message', data => broadcast(ws, data.toString())));

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Laptop: http://localhost:${port}/world.html`);
  for (const nets of Object.values(os.networkInterfaces())) for (const n of nets || []) {
    if (n.family === 'IPv4' && !n.internal) console.log(`Phone:  http://${n.address}:${port}/controller.html`);
  }
});
