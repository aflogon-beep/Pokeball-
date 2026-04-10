# ⚡ PokéBattle

Juego de combate Pokémon Generación 1 — 151 Pokémon, modo CPU y 2 jugadores.

## 🚀 GitHub Pages

Sube esta carpeta a tu repo de GitHub y activa Pages en `Settings → Pages → Deploy from branch → main / root`.

La URL será: `https://[tu-usuario].github.io/[nombre-repo]/`

## 📱 PWA — Instalar como app

Al abrir la URL en móvil/tablet, el navegador mostrará **"Añadir a pantalla de inicio"**.  
Se instala como app nativa: pantalla completa, sin barra del navegador, funciona offline.

## 📁 Estructura

```
├── index.html              ← Entrada (solo imports)
├── manifest.json           ← PWA config
├── sw.js                   ← Service Worker (offline cache)
├── css/styles.css          ← Estilos
├── icons/                  ← Iconos PWA (72–512px)
└── js/
    ├── audio.js            ← Web Audio, SFX, música por escenario
    ├── data.js             ← 151 Pokémon, movimientos, tipos, Pokédex
    ├── battle.js           ← Motor de combate, CPU AI, pociones
    ├── sprites.js          ← Animaciones, sprites, execAnim
    ├── main.js             ← Estado G, router, render, boot
    ├── scenarios/
    │   ├── scenes.js       ← Datos de escenarios
    │   └── canvas-scenes.js ← 7 escenarios Canvas animados 60fps
    └── ui/
        └── screens.js      ← Todas las pantallas del juego
```

## ✨ Features v9.3.4

- 151 Pokémon con carta TCG individual
- 7 escenarios Canvas animados (Campo, Galaxia, Estadio, Fútbol, Cueva, Playa, Noche)
- Clima por escenario (lluvia, tormenta, niebla, bruma)
- Música procedural diferente por escenario
- HUD estilo Street Fighter IV
- Panel de ataque rediseñado (efectividad, barras de poder, PP)
- 3 niveles de dificultad CPU (Fácil/Normal/Difícil)
- Pociones, equipo favorito guardado, récords globales
- Pokémon Shiny (1/50), movimientos de estado
- Tutorial interactivo primera vez
- Splash screen PWA, funciona offline
