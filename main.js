// main.js
import { app, BrowserWindow } from "electron";
import path from "node:path";

// 🔑 levanta tu servidor Express
import "./index.js";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,   // 🔑 pantalla completa
    kiosk: true,        // 🔑 modo kiosco (bloquea salir con atajos)
    frame: false,       // 🔑 sin bordes ni barra
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(process.cwd(), "preload.js"), // si lo usas
      nodeIntegration: false,
    },
  });

  // Carga la app servida por Express
  mainWindow.loadURL("http://127.0.0.1:5500");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
