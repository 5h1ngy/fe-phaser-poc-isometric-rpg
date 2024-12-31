import Phaser from 'phaser';
import MainScene from '@/scenes/MainScene';
import { injectCSS } from '@/utils/CSSInjector';

// Configurazione principale del gioco
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: MainScene,
    physics: {
        default: 'arcade',
        arcade: { debug: false },
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    parent: 'app',
};

// Inizializza il gioco
new Phaser.Game(config);

// Inietta lo stile CSS
injectCSS();
