#!/bin/bash

# Script para crear archivos de audio de prueba muy pequeños
# Estos archivos sirven para demostrar el sistema de fallback

echo "🎵 Creando archivos de audio de prueba para el sistema de fallback..."

# Crear directorio si no existe
mkdir -p /Users/javierignacioherrera/Desktop/poke/public

# Lista de archivos de audio necesarios
audio_files=(
    "pc.mp3"
    "pokeballcatch.mp3" 
    "pokeballthrow.mp3"
    "pokeballexplode.mp3"
    "pokeballwait.mp3"
    "pokeballreturn.mp3"
    "catchmusic.mp3"
    "superpower.mp3"
    "heal.mp3"
    "pokemongym.mp3"
    "wintrainer.mp3"
    "gymbattle.mp3"
    "trainerbattle.mp3"
    "wingym.mp3"
    "obtainbadge.mp3"
)

# Crear un archivo de audio de prueba muy pequeño (silencio)
# Este es un archivo MP3 válido de 0.1 segundos de silencio
base64_audio="SUQzAwAAAAAA//NQAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACMgCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIungAA"

cd /Users/javierignacioherrera/Desktop/poke/public

for file in "${audio_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "Creando archivo de prueba: $file"
        # Crear archivo MP3 de prueba (silencio muy corto)
        echo "$base64_audio" | base64 -D > "$file" 2>/dev/null || echo "<!-- Audio fallback: $file -->" > "$file"
    else
        echo "Ya existe: $file"
    fi
done

echo "✅ Archivos de audio de prueba creados"
echo "📝 Nota: Estos son archivos de prueba. Para producción, reemplázalos con los archivos de audio reales."
echo "📂 Ubicación: /Users/javierignacioherrera/Desktop/poke/public/"
