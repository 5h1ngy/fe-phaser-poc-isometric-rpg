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
    private collisionTiles = [0]; // es: tile di acqua

    // Mappa dei frame
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
        this.mapData = generateRandomMap(this.mapSize, Object.keys(this.tileFrames).length);

        // Crea il tilemap isometrico
        this.createTilemap();

        // Trova posizione valida per il player
        const { startX, startY } = this.findValidPlayerPosition();

        // Crea il player in Matter
        this.player = new Player(this, startX, startY, 'player');
        // Creiamo le animazioni
        this.player.createAnimations(this);

        // Imposta i limiti del mondo Matter (opzionale)
        this.configureWorldBounds();

        // Configura la camera
        this.configureCameraBounds();
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Gestione resize
        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: window.innerWidth, height: window.innerHeight });

        DebugLogger.log('create', 'Scene creation completed.');
    }

    update() {
        // In Matter, non abbiamo `collide(...)`, 
        // ma possiamo usare check manuali o eventi di collisione. 
        // Se vuoi "fermare" il player quando collide con acqua, 
        // puoi farlo in Player.update, controllando se tocca corpi con label 'waterTile', 
        // oppure gestire un event listener su 'collisionstart'.
        this.player.update(this, 10);
    }

    /**
     * Trova randomicamente una posizione (isoX, isoY) su una tile che NON sia acqua (0).
     */
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
        // Non esistendo un 'layer' di Matter come in Arcade, 
        // semplicemente creeremo sprite statici matter per i tile di acqua 
        // (se vogliamo collisione) o sprite "normali" (no collision) per tile non-ostacolo.
        const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const isoY = (x + y) * (this.isoHeight * this.isoScale / 2);

                const frameKey = this.tileFrames[this.mapData[y][x]];
                if (!frameKey) continue;

                // Se è acqua => sprite col corpo matter, altrimenti sprite "libero" 
                // (o potresti farlo sempre matter, ma sensor se non è ostacolo).
                if (this.collisionTiles.includes(this.mapData[y][x])) {
                    // Creiamo corpo statico per "acqua"
                    this.createMatterTile(isoX, isoY, frameKey, true);
                } else {
                    // Creiamo uno sprite "normale" (no collision)
                    // Oppure matter + sensor, come preferisci
                    this.add.image(isoX, isoY, 'tileset', frameKey)
                        .setScale(this.texScale)
                        .setOrigin(0.5, 0.75);
                }
            }
        }
    }

    /**
     * Crea un tile "statico" in Matter, con un rettangolo di collisione
     * che copre l'intero sprite, e un label personalizzato.
     */
    private createMatterTile(isoX: number, isoY: number, frameKey: string, isWater: boolean) {
        // Creiamo un matter sprite statico
        const sprite = this.matter.add.sprite(isoX, isoY, 'tileset', frameKey, {
            // L'opzione "isStatic" lo fa rimanere fermo
            isStatic: true
        });

        sprite.setScale(this.texScale);
        sprite.setOrigin(0.5, 0.75);

        // Rettangolo di collisione
        const realW = this.texWidth * this.texScale;
        const realH = this.texHeight * this.texScale;

        // Definiamo un body rettangolare, 
        // notando che matter considera (0,0) come centro del body di default.
        // Con setOrigin(0.5,0.75), potresti dover definire l'offset manuale.
        // In Matter, puoi usare sprite.setBody() con offsetX, offsetY:
        // const offsetY = realH * 0.5 - (realH * 0.75); 
        // se originY=0.75, il “centro” è 0.75 dalla top
        // gioca con questi numeri per allineare perfettamente.

        sprite.setBody({
            type: 'fromVertices',
            verts: [
                { x: 0,   y: -32 },  
                { x: 64,  y: 0   },  
                { x: 0,   y: 32  },  
                { x: -64, y: 0   }
            ],
            // la geometria è centrata sul (0,0) del body, 
            // che corrisponde al center del frame. A volte serve un offset se l'origin non è (0.5,0.5).
            width: realW,
            height: realH
        }, {
            isStatic: true
        });

        // Forse serve un spostamento manuale 
        // (in Matter, la shape è centrata, ma la sprite ha origin(0.5,0.75)).
        // Prova ad aggiustare:
        sprite.setOrigin(0.5, 0.5); // e poi shiftare la Y di isoY di - realH * 0.25, 
        // Oppure lasci origin(0.5,0.75) e definisci un 'center of mass offset'.
        // Esempio:
        // sprite.setBody({
        //    type: 'rectangle',
        //    width: realW,
        //    height: realH
        // }, { isStatic: true })
        // .setPosition(isoX, isoY - realH*0.25);

        // Dare un label per riconoscere l'acqua
        if (isWater) {
            sprite.setData('tileType', 'water');
        } else {
            sprite.setData('tileType', 'solid');
        }

        return sprite;
    }

    /**
     * Imposta i limiti del mondo Matter (facoltativo).
     */
    private configureWorldBounds() {
        // setBounds(x, y, width, height, thickness)
        // x,y => top-left, width,height => dimensioni
        // thickness => spessore dei muri
        this.matter.world.setBounds(0, 0, 5000, 5000);
        // Decidi tu i parametri. 
        // Se la mappa "finisce" a maxX, maxY calcolati, mettili qui.
    }

    /**
     * Calcolo dei limiti della camera in base alle dimensioni isometriche della mappa.
     */
    private configureCameraBounds() {
        const halfW = this.isoWidth * this.isoScale / 2;
        const halfH = this.isoHeight * this.isoScale / 2;
        const offsetX = (this.mapSize - 1) * halfW;

        const minX = 0;
        const maxX = (this.mapSize - 1) * halfW + offsetX;

        const minY = 0;
        const maxY = 2 * (this.mapSize - 1) * halfH;

        this.cameras.main.setBounds(
            minX,
            minY,
            maxX - minX,
            maxY - minY
        );
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
