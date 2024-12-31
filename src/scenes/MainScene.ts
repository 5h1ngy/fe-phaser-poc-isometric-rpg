import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private mapSize = 20;
    private tileSize = 128;
    private mapData: number[][] = [];
    private resizing = false;
    private tileFrames: { [key: number]: string } = {
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0',
        3: 'sand_0',
        4: 'grass_0',
        5: 'snow_0',
    };

    constructor() {
        super('MainScene');
        DebugLogger.log('constructor', 'MainScene initialized.');
    }

    preload() {
        DebugLogger.log('preload', 'Starting asset loading.');
        this.load.atlas('tileset', 'public/assets/tileset/ai_blocks.png', 'public/assets/tileset/ai_blocks.json');
        this.load.atlas('player', 'public/assets/spritesheet/lpc_naked.png', 'public/assets/spritesheet/lpc_naked.json');
        DebugLogger.log('preload', 'Assets loaded successfully.');
    }

    create() {
        DebugLogger.log('create', 'Starting scene creation.');

        this.mapData = generateRandomMap(this.mapSize, 6);
        this.createTilemap();

        const startX = (this.mapSize - 1) * (this.tileSize / 2);
        const startY = (this.mapSize - 1) * (this.tileSize / 4);

        // Inizializza il player come oggetto separato
        this.player = new Player(this, startX, startY, 'player');
        this.player.createAnimations(this);

        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: window.innerWidth, height: window.innerHeight });
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        DebugLogger.log('create', 'Scene creation completed.');
    }

    update() {
        this.player.update(this, 100); // Aggiorna il movimento del player
    }

    private createTilemap() {
        DebugLogger.log('createTilemap', 'Creating isometric tilemap.');
        const layer = this.add.layer();
        const offsetX = (this.mapSize - 1) * (this.tileSize / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.tileSize / 2) + offsetX;
                const isoY = (x + y) * (this.tileSize / 4);
                const tileFrame = this.tileFrames[this.mapData[y][x]];

                if (tileFrame) {
                    const tile = this.add.image(isoX, isoY, 'tileset', tileFrame).setOrigin(0.5, 0.5).setScale(1.5);
                    layer.add(tile);
                }
            }
        }

        layer.setDepth(0);
        DebugLogger.log('createTilemap', 'Isometric tilemap created successfully.');
    }

    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return;
        this.resizing = true;

        const { width, height } = gameSize;
        DebugLogger.log('handleResize', `Handling resize to width: ${width}, height: ${height}`);

        this.scale.resize(width, height);
        this.cameras.main.setViewport(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, this.mapSize * this.tileSize, this.mapSize * this.tileSize);

        this.resizing = false;
    }
}
