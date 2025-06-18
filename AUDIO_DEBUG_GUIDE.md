# 🔊 Guía del Probador de Audio - Liga Pokémon

## 📋 Descripción

La página **Audio Debug** (`/audio-debug`) es una herramienta completa para probar todos los sonidos de la aplicación Liga Pokémon en diferentes dispositivos y plataformas. Te permite identificar qué sonidos funcionan correctamente y cuáles necesitan ajustes.

## 🌐 Acceso

**URL Local:** `http://localhost:5173/audio-debug` (en desarrollo)
**URL Producción:** `https://tu-dominio.com/audio-debug`

## 🎯 Funcionalidades

### 🎵 Sonidos Incluidos
La página prueba **47 sonidos diferentes** organizados en categorías:

- **PC** - Sonidos de interfaz de PC
- **Pokeball** - Efectos de Pokéballs (lanzar, atrapar, etc.)
- **Capture** - Música de captura 
- **Special** - Efectos especiales (curar, subir nivel, shiny, etc.)
- **UI** - Sonidos de interfaz de usuario
- **Background** - Música de fondo (gimnasio, batalla, etc.)
- **Games** - Sonidos de minijuegos

### 🧪 Métodos de Prueba
Para cada sonido puedes probar **4 métodos diferentes**:

1. **🔧 Sistema** - Usa nuestro sistema `soundEffects.ts` (con fallback automático)
2. **🌐 GitHub** - Carga directa desde nuestro CDN de GitHub Pages
3. **⚡ PS** - Desde Pokémon Showdown (solo algunos sonidos disponibles)
4. **📁 Local** - Desde archivos locales del proyecto

### 📊 Estados de Resultados
- **✅ Éxito** - El sonido se reprodujo correctamente
- **❌ Error** - Falló al reproducir (con mensaje de error detallado)
- **🔘 Sin probar** - No se ha probado aún
- **🚫 No disponible** - No existe para ese método

## 🛠️ Uso en Testing

### Para Desktop
1. Abre las **DevTools** (F12) para ver logs detallados
2. Prueba cada método para sonidos problemáticos
3. Identifica patrones (ej: solo funcionan archivos locales)

### Para Mobile
1. Conecta el dispositivo móvil a tu red
2. Accede desde el móvil a la URL de tu desarrollo local
3. Usa la consola remota o logs para debug
4. **Importante:** Los móviles requieren interacción del usuario antes de reproducir audio

## 🔍 Troubleshooting

### Errores Comunes
- **CORS Error** - El archivo está bloqueado por política de mismo origen
- **NotSupportedError** - El formato de audio no es compatible
- **NotAllowedError** - Autoplay bloqueado (común en móviles)
- **404 Not Found** - El archivo no existe en esa ubicación

### Tips de Debugging
1. **Revisa la consola** - Los logs muestran el proceso completo de carga
2. **Prueba diferentes métodos** - Si uno falla, otro puede funcionar
3. **Verifica las URLs** - Usa la sección "Ver URLs" para comprobar rutas
4. **Interacción del usuario** - En móviles, toca la pantalla antes de probar

## 📈 Interpretación de Resultados

### Patrón Ideal ✅
Todos los métodos deberían funcionar, indicando compatibilidad total.

### Patrón Problemático ❌
- Solo funciona "Local" = Problema de CORS/CDN
- Solo funciona "Sistema" = El fallback está funcionando
- Nada funciona = Formato incompatible o archivo faltante

## 📋 Reporte de Issues

Cuando encuentres problemas, reporta:
1. **Dispositivo** (iOS/Android/Desktop)
2. **Navegador** y versión
3. **Sonidos problemáticos** y métodos que fallan
4. **Mensajes de error** de la consola
5. **Screenshot** del resumen de resultados

## 🔧 Desarrollo

El componente está en `/src/components/ui/AudioDebugPage.tsx` y utiliza:
- Sistema de audio principal (`soundEffects.ts`)
- URLs de CDN de GitHub Pages
- Fallback a Pokémon Showdown
- Archivos locales como último recurso

---

**💡 Consejo:** Usa esta herramienta cada vez que hagas cambios al sistema de audio para asegurar compatibilidad cross-platform.
