import Phaser from 'phaser';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';
import { Map } from '@/maps/Map';

export default class MainScene extends Phaser.Scene {
    private resizing: boolean;
    private player!: Player;

    private isoWidth = 128;
    private isoHeight = 64;
    private isoScale = 1;

    private texWidth = 128;
    private texHeight = 147;
    private texScale = 1;

    private mapSize = 20;
    private collisionTiles = [0];
    private tileFrames: { [key: number]: string } = {
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0'
    };

    private map!: Map;

    constructor() {
        super('MainScene');
        this.resizing = false;
        DebugLogger.log('constructor', 'MainScene initialized.');
    }

    preload() {
        DebugLogger.log('preload', 'Starting asset loading.');
        this.load.atlas(
            'tileset',
            'public/assets/tileset/ai_blocks.png',
            'public/assets/tileset/ai_blocks.json'
        );
        this.load.atlas(
            'player',
            'public/assets/spritesheet/lpc_naked.png',
            'public/assets/spritesheet/lpc_naked.json'
        );
        DebugLogger.log('preload', 'Assets loaded successfully.');
    }

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

    update() {
        this.player.update(this, 10);
    }

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

    private configureWorldBounds() {
        this.matter.world.setBounds(0, 0, 5000, 5000);
    }

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

    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return;
        this.resizing = true;

        const { width, height } = gameSize;
        this.scale.resize(width, height);
        this.cameras.main.setSize(width, height);

        this.resizing = false;
    }
}
