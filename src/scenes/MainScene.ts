import Phaser from 'phaser';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';
import { Map } from '@/maps/Map';

/**
 * Scena principale del gioco.
 * Gestisce la logica del gameplay, inclusa la mappa, il giocatore e la configurazione della scena.
 */
export default class MainScene extends Phaser.Scene {
    /** Flag per prevenire ridimensionamenti multipli */
    private resizing: boolean;

    /** Oggetto giocatore */
    private player!: Player;

    /** Dimensioni logiche e scalari per la proiezione isometrica */
    private isoWidth = 128;
    private isoHeight = 64;
    private isoScale = 1;

    /** Dimensioni reali e scalari degli asset */
    private texWidth = 128;
    private texHeight = 147;
    private texScale = 1;

    /** Dimensione della mappa */
    private mapSize = 20;

    /** Indici dei tile che causano collisioni */
    private collisionTiles = [0];

    /** Mappa dei frame per i vari tipi di tile */
    private tileFrames: { [key: number]: string } = {
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0',
    };

    /** Oggetto mappa */
    private map!: Map;

    /**
     * Costruttore della scena principale.
     * Inizializza la scena e il logger di debug.
     */
    constructor() {
        super('MainScene');
        this.resizing = false;
        DebugLogger.log('constructor', 'MainScene initialized.');
    }

    /**
     * Precarica gli asset necessari per la scena.
     */
    preload() {
        DebugLogger.log('preload', 'Starting asset loading.', import.meta.env.VITE_MODE);

        this.load.atlas(
            'tileset',
            import.meta.env.VITE_BASENAME + '/assets/tileset/ai_blocks.png',
            import.meta.env.VITE_BASENAME + '/assets/tileset/ai_blocks.json',
        );

        this.load.atlas(
            'player',
            import.meta.env.VITE_BASENAME + '/assets/spritesheet/lpc_naked.png',
            import.meta.env.VITE_BASENAME + '/assets/spritesheet/lpc_naked.json',
        );

        DebugLogger.log('preload', 'Assets loaded successfully.');
    }

    /**
     * Crea gli elementi della scena, inclusi mappa e giocatore.
     */
    create() {
        DebugLogger.log('create', 'Starting scene creation.');

        this.map = new Map(
            this,
            this.mapSize,
            this.isoWidth,
            this.isoHeight,
            this.isoScale,
            this.texWidth,
            this.texHeight,
            this.texScale,
            this.collisionTiles,
            this.tileFrames
        );

        this.map.createTilemap();

        const { startX, startY } = this.findValidPlayerPosition();

        this.player = new Player(this, startX, startY, 'player');
        this.player.createAnimations(this);

        this.configureWorldBounds();
        this.configureCameraBounds();

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: window.innerWidth, height: window.innerHeight });

        DebugLogger.log('create', 'Scene creation completed.');
    }

    /**
     * Aggiorna la scena ad ogni frame.
     * @param delta Tempo trascorso dall'ultimo frame.
     */
    update() {
        this.player.update(this, 10);
    }

    /**
     * Trova una posizione valida per il giocatore sulla mappa.
     * @returns Le coordinate `startX` e `startY` valide.
     */
    private findValidPlayerPosition(): { startX: number; startY: number } {
        const mapData = this.map.getMapData();

        while (true) {
            const rx = Phaser.Math.Between(0, this.mapSize - 1);
            const ry = Phaser.Math.Between(0, this.mapSize - 1);

            if (mapData[ry][rx] !== 0) {
                const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);
                const startX = (rx - ry) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const startY = (rx + ry) * (this.isoHeight * this.isoScale / 2);
                return { startX, startY };
            }
        }
    }

    /**
     * Configura i limiti del mondo fisico Matter.js.
     */
    private configureWorldBounds() {
        this.matter.world.setBounds(0, 0, 5000, 5000);
    }

    /**
     * Configura i limiti della camera in base alla dimensione della mappa.
     */
    private configureCameraBounds() {
        const halfW = this.isoWidth * this.isoScale / 2;
        const halfH = this.isoHeight * this.isoScale / 2;
        const offsetX = (this.mapSize - 1) * halfW;

        const minX = 0;
        const maxX = (this.mapSize - 1) * halfW + offsetX;
        const minY = 0;
        const maxY = 2 * (this.mapSize - 1) * halfH;

        this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY);
    }

    /**
     * Gestisce il ridimensionamento della finestra del gioco.
     * @param gameSize L'oggetto con la larghezza e l'altezza della finestra ridimensionata.
     */
    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return;
        this.resizing = true;

        const { width, height } = gameSize;
        this.scale.resize(width, height);
        this.cameras.main.setSize(width, height);

        this.resizing = false;
    }
}
