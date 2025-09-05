/* ---------- dependencias ---------- */
import express          from 'express';
import { createServer } from 'http';
import path             from 'node:path';
import QRCode           from 'qrcode';
import fs from "node:fs";

import cors from 'cors';

const rutaJsonLocal = "./OpenBeer/config/config.json";
const rutaJsonExterna = "/usr/local/device/services/OpenBeer/config/config.json";

/* ---------- MQTT: solo recepción de payload en bruto ---------- */
import { startRawMQTT } from './src/mqtt/mqttclient.js';            // ← tu cliente “ligero”
//const { bus } = startRawMQTT(rutaJsonExterna);        // lee cfg y emite {topic,payload} , ruta fuera del proyecto
const { bus } = startRawMQTT(rutaJsonLocal);        // lee cfg y emite {topic,payload}


let config = {};

try {
  //const rawData = fs.readFileSync(rutaJsonExterna, "utf-8"); // Ruta para mantener la configuración fuera del proyecto
  const rawData = fs.readFileSync(rutaJsonLocal, "utf-8");
  config = JSON.parse(rawData);
  console.log(config.mqtt, config.topics);
  console.log("✅ Configuración cargada correctamente.");
} catch (error) {
  console.error("❌ Error cargando config.json:", error.message);
  // Evita que arranque sin configuración válida
  process.exit(1);
}

/* ---------- estado de la aplicación ---------- */
const state = {
  page: '1',          // 1 = home, 2 = service, 3 = final
  id: null,
  saldo: 0,
  costoML: 0,
  ml: 0,
  total: 0
};

let finalTimer = null;  // temporizador para volver a HOME

/* ---------- expresiones para cada tipo de mensaje ---------- */
const reOpen  = /^esp(\d{4})-\d+-(\d+)-(\d+)-open$/;
const reData  = /^ras(\d{4})-(\d+)-\d+-\d+-data$/;
const reClose = /^ras(\d{4})-(\d+)-(\d+)-close$/;

/* ---------- analizar cada payload recibido ---------- */
bus.on('msg', ({ topic, payload }) => {
  let m;
  if ((m = payload.match(reOpen))) {
    /* --- OPEN ------------------------------------------------------ */
    Object.assign(state, {
      page: '2',                       // service
      id: m[1],
      saldo: +m[2],
      costoML: +m[3],
      ml: 0,
      total: 0
    });
    clearTimeout(finalTimer);          // cancela retorno si estaba programado
  } else if ((m = payload.match(reData))) {
    /* --- DATA ------------------------------------------------------ */
    state.ml    = +m[2];
    state.total  = state.ml * state.costoML;
  } else if ((m = payload.match(reClose))) {
    /* --- CLOSE ----------------------------------------------------- */
    Object.assign(state, {
      page: '3',                       // final
      ml: +m[2],
      total: +m[3]
    });

    clearTimeout(finalTimer);          // reinicia (por si acaso)
    finalTimer = setTimeout(() => {
      state.page = '1';                // volver a HOME
      console.log('⏱️  Regreso automático a HOME (30 s)');
    }, 10_000);
  }

  console.log('[MQTT]', topic, payload, '→ page', state.page);
});

/* ---------- Servidor HTTP ---------- */
const app    = express();
app.use(cors());
const server = createServer(app);

/* estáticos */
app.use(express.static('public'));
app.use(express.static('public/frontend'));
app.use(express.static('public/js'));

/* página principal */
app.get('/', (_req, res) =>
  res.sendFile(path.resolve('./public/html/index.html')));

/* QR dinámico */
app.get('/qr', async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).send('Falta parámetro data');
  try {
    res.type('png').send(await QRCode.toBuffer(data, { type: 'png' }));
  } catch {
    res.status(500).send('Error generando QR');
  }
});

/* ---------- ENDPOINTS REST para el frontend ---------- */
app.get('/api/page', (_q, r) => r.json({ page: state.page }));

/* ---------- ENDPOINT CONFIG FRONT ---------- */
app.get('/config', (_req, res) => {
  if (!config.front) {
    return res.status(500).json({ error: "No se encontró configuración de 'front'" });
  }
  res.json(config.front);
});

app.get('/api/transaction', (_q, r) => r.json({
  id:            state.id,
  saldoInicial:  state.saldo,
  costoML:       state.costoML,
  mlAcumulados:  state.ml,
  costoTotal:    state.total,
  saldoRestante: state.saldo - state.total,
  page:          state.page
}));

/* ---------- arrancar servidor ---------- */
server.listen(5500,'127.0.0.1', () => {
  console.log('Servidor HTTP en: http://127.0.0.1:5500');
});
