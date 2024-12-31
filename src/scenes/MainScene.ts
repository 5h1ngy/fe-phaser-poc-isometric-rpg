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
        0: 'water_0', // Blocco d'acqua
        1: 'stone_0',
        2: 'terrain_0',
        3: 'sand_0',
        4: 'grass_0',
        5: 'snow_0',
    };
    private collisionTiles = [0]; // Blocchi considerati come ostacoli

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

        this.mapData = generateRandomMap(this.mapSize, Object.keys(this.tileFrames).length);
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
        // Controlla le collisioni con i tile d'acqua
        this.physics.world.collide(this.player, this.waterTiles, () => {
            // Blocca il movimento solo se collide con la parte visibile
            this.player.stopMovement();
        });

        this.player.update(this, 100); // Aggiorna il movimento del player
    }


    private waterTiles!: Phaser.Physics.Arcade.Group;

    private createTilemap() {
        DebugLogger.log('createTilemap', 'Creating isometric tilemap.');
        const layer = this.add.layer();

        // Dimensioni reali dei tile
        const tileWidth = 128;
        const tileHeight = 147;

        // Offset per centrare la mappa
        const offsetX = (this.mapSize - 1) * (tileWidth / 2);
        const tileScale = 1.5; // Scala applicata ai tile

        // Crea un gruppo per i tile con collisioni
        this.waterTiles = this.physics.add.group({
            allowGravity: false,
            immovable: true,
        });

        // Aggiungi un oggetto grafico per disegnare i bordi
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1); // Colore rosso per i bordi (RGB: 255, 0, 0)

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                // Calcolo posizione isometrica
                const isoX = (x - y) * (tileWidth * tileScale / 2) + offsetX;
                const isoY = (x + y) * (tileHeight * tileScale / 2) / 2;

                const tileFrame = this.tileFrames[this.mapData[y][x]];

                if (tileFrame) {
                    const tile = this.add.image(isoX, isoY, 'tileset', tileFrame)
                        .setOrigin(0.5, 1) // Origine posizionata alla base
                        .setScale(tileScale); // Scala uniforme per i tile
                    layer.add(tile);

                    // Usa collisionTiles per verificare se il blocco è un ostacolo
                    if (this.collisionTiles.includes(this.mapData[y][x])) {
                        const collisionTile = this.physics.add.image(isoX, isoY, 'tileset', tileFrame)
                            .setOrigin(0.5, 1)
                            .setScale(tileScale)
                            .setAlpha(0); // Rendi invisibile la versione interattiva per la fisica
                        this.waterTiles.add(collisionTile);

                        // Disegna un rettangolo rosso attorno al tile
                        graphics.strokeRect(
                            isoX - (tileWidth * tileScale / 2), // Posizione X
                            isoY - (tileHeight * tileScale),    // Posizione Y
                            tileWidth * tileScale,             // Larghezza
                            tileHeight * tileScale             // Altezza
                        );
                    }
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
