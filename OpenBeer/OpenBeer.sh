#!/bin/bash
# ====================================
# Script para arrancar OpenBeer en modo Electron + Express
# ====================================

APP_DIR="/usr/local/device/nodejs/OpenBeer"   # <-- cambia si tu proyecto está en otro path
cd "$APP_DIR" || exit 1

# Variables de entorno necesarias para que Electron vea la pantalla
export NODE_ENV=production
export PORT=5500
export DISPLAY=:0
export XAUTHORITY=/home/infomedia/.Xauthority

# Iniciar la app
npm start
