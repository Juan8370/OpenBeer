#!/bin/bash
# ====================================
# Script para arrancar dispenser.front en modo Electron + Express
# ====================================

APP_DIR="/usr/local/device/nodejs/dispenser.front"
cd "$APP_DIR" || exit 1

# Variables de entorno necesarias para que Electron vea la pantalla
export NODE_ENV=production
export PORT=5500
export DISPLAY=:0
export XAUTHORITY=/home/infomedia/.Xauthority

# Ejecutar como el usuario de la sesión gráfica
sudo -u infomedia npm run electron
