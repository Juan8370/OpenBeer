Sí ✅, hay una forma mucho más fácil y sin tanto enredo con `systemd`.

En lugar de hacer un servicio, puedes decirle al **entorno gráfico del usuario `Infomedia`** que arranque Chromium automáticamente al iniciar sesión.

Como usas **Labwc (Wayland)**, este respeta un archivo de autostart muy parecido a Openbox.

---

### 🔧 Método sencillo: `~/.config/labwc/autostart`

1. Entra como el usuario `Infomedia` (no root).
2. Crea la carpeta si no existe:

   ```bash
   mkdir -p /home/Infomedia/.config/labwc
   ```
3. Edita el archivo `autostart`:

   ```bash
   nano /home/Infomedia/.config/labwc/autostart
   ```
4. Agrega esta línea:

   ```bash
   chromium-browser --noerrdialogs --disable-infobars --kiosk http://127.0.0.1:5500 &
   ```
5. Guarda y reinicia la Raspberry.

---

### 🚀 Resultado

Cuando `Infomedia` inicie sesión gráfica en Labwc, Chromium abrirá automáticamente en **modo kiosco** en `127.0.0.1:5500`.
No necesitas systemd, ni sudo, ni variables raras de `DISPLAY`.

---

👉 ¿quieres que te deje el contenido completo de un `autostart` típico de **Labwc** con Chromium en kiosco ya configurado?

---


Perfecto 👌.
En ese caso lo más directo es **iniciar Chromium en modo kiosk** con flags que desactiven todas las distracciones (mensajes, notificaciones, restauración de pestañas, traducciones, etc.).

Puedes crear un **.desktop autostart** para el usuario `Infomedia` en su Raspberry Pi. Así se abrirá automáticamente cada vez que arranque la sesión gráfica.

---

### Paso 1: Crear el archivo de autostart

Crea la carpeta (si no existe):

```bash
mkdir -p /home/Infomedia/.config/autostart
```

Luego crea el archivo:

```bash
nano /home/Infomedia/.config/autostart/kiosk.desktop
```

---

### Paso 2: Contenido del archivo `kiosk.desktop`

Pon lo siguiente:

```ini
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=chromium-browser --noerrdialogs --disable-infobars --kiosk --incognito \
  --disable-translate \
  --no-first-run \
  --fast \
  --fast-start \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --disable-features=Translate,AutofillAssistant,PasswordManager,NotificationIndicators \
  http://127.0.0.1:5500
X-GNOME-Autostart-enabled=true
```

---

### Explicación de los flags más importantes

* `--kiosk` → pantalla completa sin controles.
* `--incognito` → no guarda historial ni restaura sesiones.
* `--no-first-run` → evita el mensaje de “configuración inicial”.
* `--disable-infobars` → oculta la barra “Chromium se controla con una extensión”.
* `--disable-translate` → desactiva el popup de traducción.
* `--disable-features=Translate,AutofillAssistant,PasswordManager,NotificationIndicators` → elimina traducción, autocompletado, gestor de contraseñas y notificaciones.
* `--noerrdialogs` → no muestra ventanas de error si falla una página.
* `--fast --fast-start` → optimiza arranque en Raspberry.
* `--disable-pinch` y `--overscroll-history-navigation=0` → evita gestos táctiles indeseados (si tu dispositivo es touch).

---

### Paso 3: Dar permisos

```bash
chmod +x /home/Infomedia/.config/autostart/kiosk.desktop
```

---

Con esto, cada vez que el usuario **Infomedia** inicie sesión gráfica, Chromium se abrirá directamente en `http://127.0.0.1:5500` en **modo kiosk sin distracciones**.

---

¿Quieres que te prepare también una **versión con systemd** para que arranque incluso si no entras al escritorio (ej. en un entorno más minimalista)?
