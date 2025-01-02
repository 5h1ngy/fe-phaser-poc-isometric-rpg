import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private mapData: number[][] = [];

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
        2: 'terrain_0',
    };

    private resizing = false;

    constructor() {
        super('MainScene');
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

        this.mapData = generateRandomMap(this.mapSize, Object.keys(this.tileFrames).length);
        this.createTilemap();

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
        while (true) {
            const rx = Phaser.Math.Between(0, this.mapSize - 1);
            const ry = Phaser.Math.Between(0, this.mapSize - 1);

            if (this.mapData[ry][rx] !== 0) {
                const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);
                const startX = (rx - ry) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const startY = (rx + ry) * (this.isoHeight * this.isoScale / 2);
                return { startX, startY };
            }
        }
    }

    private createTilemap() {
        const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const isoY = (x + y) * (this.isoHeight * this.isoScale / 2);

                const frameKey = this.tileFrames[this.mapData[y][x]];
                if (!frameKey) continue;

                if (this.collisionTiles.includes(this.mapData[y][x])) {
                    this.createMatterTile(isoX, isoY, frameKey, true);
                } else {
                    this.add.image(isoX, isoY, 'tileset', frameKey)
                        .setScale(this.texScale)
                        .setOrigin(0.5, 0.5);
                }
            }
        }
    }

    private createMatterTile(isoX: number, isoY: number, frameKey: string, isWater: boolean) {
        const sprite = this.matter.add.sprite(isoX, isoY, 'tileset', frameKey, { isStatic: true });
        sprite.setScale(this.texScale);
        
        const realW = this.texWidth * this.texScale;
        const realH = this.texHeight * this.texScale;

        sprite.setBody({
            width: realW, height: realH,
            type: 'fromVertices',
            verts: [
                { x: 0, y: -32 },
                { x: 64, y: 0 },
                { x: 0, y: 32 },
                { x: -64, y: 0 }
            ],
        }, { isStatic: true });
        
        sprite.setPosition(sprite.x, sprite.y);

        if (isWater) {
            sprite.setData('tileType', 'water');
            sprite.setOrigin(0.5, 0.3);
        } else {
            sprite.setData('tileType', 'solid');
            // sprite.setOrigin(1, 1);
        }

        return sprite;
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
