import Phaser from 'phaser';
import MainScene from '@/scenes/MainScene';
import { injectCSS } from '@/utils/CSSInjector';

/**
 * Configurazione del gioco Phaser.
 * Definisce il tipo di rendering, le dimensioni iniziali,
 * la scena principale, il sistema fisico e il comportamento di scala.
 *
 * @type {Phaser.Types.Core.GameConfig}
 */
const config: Phaser.Types.Core.GameConfig = {
    /**
     * Modalità di rendering del gioco.
     * - `Phaser.AUTO` sceglie automaticamente WebGL o Canvas in base al supporto del browser.
     */
    type: Phaser.AUTO,

    /**
     * Larghezza iniziale del canvas di gioco.
     * Utilizza la larghezza della finestra del browser.
     */
    width: window.innerWidth,

    /**
     * Altezza iniziale del canvas di gioco.
     * Utilizza l'altezza della finestra del browser.
     */
    height: window.innerHeight,

    /**
     * La scena principale del gioco.
     * @see {@link MainScene}
     */
    scene: MainScene,

    /**
     * Configurazione del sistema fisico.
     * Usa il motore fisico "Matter.js" con opzioni specifiche.
     */
    physics: {
        default: 'matter',

        /**
         * Configurazione del motore fisico Matter.js.
         * - Abilita il debug per visualizzare le collisioni.
         * - Imposta la gravità su zero (per giochi bidimensionali o isometrici senza gravità).
         */
        matter: {
            debug: true,
            gravity: { y: 0, x: 0 },
        }
    },

    /**
     * Configurazione del comportamento di scala.
     * - `Phaser.Scale.RESIZE` fa ridimensionare il canvas quando la finestra cambia dimensione.
     * - `Phaser.Scale.CENTER_BOTH` centra automaticamente il canvas nella finestra.
     */
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    /**
     * Elemento HTML dove sarà montato il canvas di Phaser.
     * L'elemento deve avere un `id` corrispondente a "app".
     */
    parent: 'app'
};

/**
 * Istanza del gioco Phaser.
 * Usa la configurazione definita in `config`.
 */
new Phaser.Game(config);

/**
 * Funzione per iniettare CSS dinamico nel documento.
 * @see {@link injectCSS}
 */
injectCSS();
