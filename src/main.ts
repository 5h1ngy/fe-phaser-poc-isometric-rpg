// src/main.ts
import Phaser from 'phaser';
import MainScene from '@/scenes/MainScene';
import { injectCSS } from '@/utils/CSSInjector';

// Configurazione principale del gioco
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: MainScene,
    // Carichiamo solo la MainScene per semplicità
    physics: {
        default: 'matter', // <-- cambia da 'arcade' a 'matter'
        matter: {
            debug: true,    // per vedere i corpi di collisione
            gravity: { y: 0, x: 0 } // se vuoi un mondo top-down senza gravità
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: 'app'
};

// Inizializza il gioco
new Phaser.Game(config);

// Inietta lo stile CSS
injectCSS();
