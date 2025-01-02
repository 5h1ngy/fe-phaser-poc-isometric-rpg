// src/scenes/MainScene.ts
import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private mapData: number[][] = [];

    // Dimensioni "logiche" per la proiezione isometrica
    private isoWidth = 128;
    private isoHeight = 64;
    private isoScale = 1;

    // Dimensioni reali dell’asset
    private texWidth = 128;
    private texHeight = 147;
    private texScale = 1;

    private mapSize = 20;
    private collisionTiles = [0]; 
    private waterTiles!: Phaser.Physics.Arcade.Group;

    // Frame mappa
    private tileFrames: { [key: number]: string } = {
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0',
        3: 'sand_0',
        4: 'grass_0',
        5: 'snow_0'
    };

    // Per gestire resize
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

        // Genera i dati della mappa
        this.mapData = generateRandomMap(
            this.mapSize,
            Object.keys(this.tileFrames).length
        );

        // Crea il tilemap
        this.createTilemap();

        // Trova posizione valida per il player
        const { startX, startY } = this.findValidPlayerPosition();

        // Crea player
        this.player = new Player(this, startX, startY, 'player');
        this.player.createAnimations(this);

        // Configura camera (ora calcoliamo i reali limiti)
        this.configureCameraBounds();
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Gestione resize
        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: window.innerWidth, height: window.innerHeight });

        DebugLogger.log('create', 'Scene creation completed.');
    }

    update() {
        // Collisione con tile d'acqua
        this.physics.world.collide(this.player, this.waterTiles, () => {
            this.player.stopMovement();
        });
        // Update player
        this.player.update(this, 1000);
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
        const layer = this.add.layer();
        this.waterTiles = this.physics.add.group({ allowGravity: false, immovable: true });

        const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const isoY = (x + y) * (this.isoHeight * this.isoScale / 2);

                const frameKey = this.tileFrames[this.mapData[y][x]];
                if (!frameKey) continue;

                const tile = this.add.image(isoX, isoY, 'tileset', frameKey)
                    .setScale(this.texScale)
                    .setOrigin(0.5, 0.75);

                layer.add(tile);

                if (this.collisionTiles.includes(this.mapData[y][x])) {
                    const cTile = this.createCollisionTile(isoX, isoY, frameKey);
                    this.waterTiles.add(cTile);
                }
            }
        }
        layer.setDepth(0);
    }

    private createCollisionTile(isoX: number, isoY: number, frameKey: string) {
        const cTile = this.physics.add.image(isoX, isoY, 'tileset', frameKey)
            .setScale(this.texScale)
            .setOrigin(0.5, 0.75)
            .setAlpha(0)
            .setImmovable(true);

        const realW = this.texWidth * this.texScale;
        const realH = this.texHeight * this.texScale;

        // Se vuoi collisione rettangolare grande come l’intero asset
        cTile.body.setSize(realW, realH);

        // Se necessario, sposta offset. Esempio:
        // cTile.body.setOffset(0, 0);

        return cTile;
    }

    /**
     * Calcolo dei limiti della camera in base alle dimensioni isometriche della mappa.
     */
    private configureCameraBounds() {
        // Calcoliamo i “minX, maxX, minY, maxY” isometrici
        // In isometrico:
        //   L'angolo “in alto a sinistra” si ottiene con x=0,y=mapSize-1
        //   L'angolo “in basso a destra” si ottiene con x=mapSize-1,y=0
        //
        // Proviamo a calcolarli in modo semplice:
        const halfW = this.isoWidth * this.isoScale / 2;
        const halfH = this.isoHeight * this.isoScale / 2;
        const offsetX = (this.mapSize - 1) * halfW;

        // minX => (0 - (mapSize-1)) * halfW + offsetX = - (mapSize-1)*halfW + offsetX = 0
        const minX = 0; 
        // maxX => (~ (mapSize-1) - 0 ) * halfW + offsetX = (mapSize-1)*halfW + offsetX
        const maxX = (this.mapSize - 1) * halfW + offsetX;

        // minY => (0 + 0) * halfH = 0
        const minY = 0;
        // maxY => ((mapSize-1) + (mapSize-1)) * halfH = (2*(mapSize-1)) * halfH
        const maxY = 2 * (this.mapSize - 1) * halfH;

        // Passiamo al setBounds
        this.cameras.main.setBounds(
            minX,
            minY,
            maxX - minX,
            maxY - minY
        );
    }

    /**
     * Corregge il resize in Phaser 3
     */
    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return;
        this.resizing = true;

        const { width, height } = gameSize;
        // Aggiorna la dimensione del renderer
        this.scale.resize(width, height);
        // Aggiorna la camera
        this.cameras.main.setSize(width, height);

        this.resizing = false;
    }
}
