// src/scenes/MainScene.ts
import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';
import { DebugLogger } from '@/utils/DebugLogger';
import Player from '@/entities/Player';

export default class MainScene extends Phaser.Scene {
    private player!: Player;
    private mapData: number[][] = [];

    // --- Dimensioni "logiche" per la proiezione isometrica (un rombo 128×64) ---
    private isoWidth = 128;      // “larghezza” del rombo
    private isoHeight = 64;      // “altezza” del rombo (≈ la metà della larghezza)
    private isoScale = 1;        // se vuoi ingrandire/rimpicciolire la mappa

    // --- Dimensioni "reali" dell’asset (128×147 px), se vuoi scalarlo graficamente
    private texWidth = 128;
    private texHeight = 147;
    private texScale = 1;        // se vuoi ingrandire l’immagine “fisicamente”

    // Bordi e collisioni
    private mapSize = 20;
    private collisionTiles = [0]; // consideriamo "acqua" come ostacolo
    private waterTiles!: Phaser.Physics.Arcade.Group;

    // Mappa dei frame
    private tileFrames: { [key: number]: string } = {
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0',
        3: 'sand_0',
        4: 'grass_0',
        5: 'snow_0'
    };

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

        // Crea il tilemap isometrico
        this.createTilemap();

        // Trova una posizione di partenza valida per il player
        const { startX, startY } = this.findValidPlayerPosition();

        // Crea il player
        this.player = new Player(this, startX, startY, 'player');
        this.player.createAnimations(this);

        // Camera
        this.configureCameraBounds();
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Resize
        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: window.innerWidth, height: window.innerHeight });

        DebugLogger.log('create', 'Scene creation completed.');
    }

    update() {
        // Collisioni con le tile d'acqua
        this.physics.world.collide(this.player, this.waterTiles, () => {
            this.player.stopMovement();
        });
        // Movimento del player
        this.player.update(this, 1000);
    }

    /**
     * Trova randomicamente una posizione (isoX, isoY) su una tile che NON sia acqua (0).
     * Usa le dimensioni "logiche" isoWidth/isoHeight.
     */
    private findValidPlayerPosition(): { startX: number; startY: number } {
        while (true) {
            const rx = Phaser.Math.Between(0, this.mapSize - 1);
            const ry = Phaser.Math.Between(0, this.mapSize - 1);

            if (this.mapData[ry][rx] !== 0) {
                // Calcolo in isometrico
                // Formula standard: 
                // isoX = (x - y) * (isoWidth / 2)
                // isoY = (x + y) * (isoHeight / 2)
                const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);
                const startX = (rx - ry) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const startY = (rx + ry) * (this.isoHeight * this.isoScale / 2);
                return { startX, startY };
            }
        }
    }

    /**
     * Crea il tilemap isometrico.
     */
    private createTilemap() {
        const layer = this.add.layer();
        this.waterTiles = this.physics.add.group({ allowGravity: false, immovable: true });

        // offsetX per centrare la mappa
        const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                // Formula standard isometrica
                const isoX = (x - y) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const isoY = (x + y) * (this.isoHeight * this.isoScale / 2);

                const frameKey = this.tileFrames[this.mapData[y][x]];
                if (!frameKey) continue;

                // Crea la sprite
                // ATTENZIONE: l'immagine reale è 128×147
                //   ma noi stiamo calcolando la base come 128×64
                //   quindi c'è "extra" in alto.
                //   Per compensare, si può abbassare la sprite di un tot px,
                //   oppure regolare l'origin per allineare la "punta" alla base.
                
                // Esempio: 
                //   origin(0.5, 0.75) => la "base" del tile ~ 3/4 in basso
                //   poi scaliamo con `texScale`.
                const tile = this.add.image(isoX, isoY, 'tileset', frameKey)
                    .setScale(this.texScale)
                    .setOrigin(0.5, 0.75);

                layer.add(tile);

                // Se è acqua => collisione
                if (this.collisionTiles.includes(this.mapData[y][x])) {
                    const cTile = this.createCollisionTile(isoX, isoY, frameKey);
                    this.waterTiles.add(cTile);
                }
            }
        }

        layer.setDepth(0);
    }

    /**
     * Crea un tile invisibile per la collisione con la stessa formula di piazzamento
     * e un bounding box grande a piacere.
     */
    private createCollisionTile(isoX: number, isoY: number, frameKey: string) {
        // Creiamo lo sprite "fantasma" con la stessa origin e scala
        const cTile = this.physics.add.image(isoX, isoY, 'tileset', frameKey)
            .setScale(this.texScale)
            .setOrigin(0.5, 0.75)
            .setAlpha(0)
            .setImmovable(true);

        // Se vuoi che la bounding box copra l'intero tile reale (128×147):
        const realW = this.texWidth * this.texScale;   // es. 128 * 1 = 128
        const realH = this.texHeight * this.texScale; // es. 147 * 1 = 147

        // Di default, Arcade usa la top-left come ancoraggio del body.
        // Con setOrigin(0.5, 0.75), il punto (x,y) è ~ a 50% in orizzontale e 75% in verticale.
        // Quindi l'angolo top-left del body è a:
        //   x - realW*0.5, y - realH*0.75
        //
        // Se vogliamo un bounding box grande come l’intera sprite:
        cTile.body.setSize(realW, realH);

        // Ora dobbiamo spostare l'offset se vogliamo che il box combaci perfettamente.
        // Di default, l'offset (0,0) corrisponde a top-left del body. 
        // Ma la top-left del body in “World” è (sprite.x - realW*0.5, sprite.y - realH*0.75).
        // Quindi, se vogliamo il bounding box copra la sprite EXACT, l'offset rimane (0,0).
        // Se vedi uno scostamento, puoi regolare qui:
        // cTile.body.setOffset(..., ...);

        // Per esempio, se la collisione deve stare solo in basso, potresti fare:
        // cTile.body.setSize(realW, realH * 0.3);
        // cTile.body.setOffset(0, realH * 0.7);
        // ... e simili.

        return cTile;
    }

    /**
     * Limiti molto ampi per la camera, così non blocchiamo il player.
     */
    private configureCameraBounds() {
        this.cameras.main.setBounds(-999999, -999999, 999999 * 2, 999999 * 2);
    }

    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return;
        this.resizing = true;

        const { width, height } = gameSize;
        this.scale.resize(width, height);
        this.cameras.main.setViewport(0, 0, width, height);

        this.resizing = false;
    }
}
