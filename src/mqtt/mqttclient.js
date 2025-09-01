import fs   from 'node:fs';
import mqtt from 'mqtt';
import { EventEmitter } from 'node:events';

/**
 * Devuelve un EventEmitter que emite: { topic, payload }
 * @param {string} cfgPath Ruta al JSON con { mqtt:{…}, topics:[…] }
 * @returns {{ bus:EventEmitter, client:mqtt.MqttClient }}
 */
export function startRawMQTT(cfgPath = './src/mqtt/mqttConfig.json') {
  const cfg                  = JSON.parse(fs.readFileSync(cfgPath));
  const { host, port, username, password, keepalive, reconnect } = cfg.mqtt;
  const url                  = /^mqtts?:\/\//.test(host) ? `${host}:${port}`
                              : `mqtt://${host}:${port}`;
  const options              = { username, password, keepalive,
                                  reconnectPeriod: reconnect };
  const client               = mqtt.connect(url, options);
  const bus                  = new EventEmitter();

  client.on('connect', () => {
    console.log('✅ MQTT conectado');
    cfg.topics.forEach(t => client.subscribe(t));
  });

  client.on('message', (topic, buf) => {
    bus.emit('msg', { topic, payload: buf.toString().trim() });
  });

  client.on('error',   e => console.error('MQTT error:', e.message));
  client.on('offline', ()=> console.warn('MQTT offline'));

  return { bus, client };
}
