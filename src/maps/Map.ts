import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';

/**
 * Classe per gestire la generazione e il rendering della mappa di gioco.
 */
export class Map {
    /** Scena di Phaser a cui appartiene la mappa */
    private scene: Phaser.Scene;

    /** Dati della mappa, rappresentati come matrice bidimensionale */
    private data: number[][] = [];

    /** Dimensione della mappa (numero di tile per lato) */
    private mapSize: number;

    /** Dimensioni logiche e scalari per la proiezione isometrica */
    private isoWidth: number;
    private isoHeight: number;
    private isoScale: number;

    /** Dimensioni reali e scalari degli asset */
    private texWidth: number;
    private texHeight: number;
    private texScale: number;

    /** Indici dei tile che causano collisioni */
    private collisionTiles: number[];

    /** Mappa dei frame per i vari tipi di tile */
    private tileFrames: { [key: number]: string };

    /**
     * Costruttore per la classe Map.
     * 
     * @param scene La scena Phaser a cui appartiene la mappa.
     * @param mapSize La dimensione della mappa (numero di tile per lato).
     * @param isoWidth Larghezza logica dei tile in isometrico.
     * @param isoHeight Altezza logica dei tile in isometrico.
     * @param isoScale Scala dei tile in isometrico.
     * @param texWidth Larghezza reale degli asset dei tile.
     * @param texHeight Altezza reale degli asset dei tile.
     * @param texScale Scala reale degli asset dei tile.
     * @param collisionTiles Array di indici dei tile che causano collisioni.
     * @param tileFrames Mappa dei frame corrispondenti agli indici dei tile.
     */
    constructor(
        scene: Phaser.Scene,
        mapSize: number,
        isoWidth: number,
        isoHeight: number,
        isoScale: number,
        texWidth: number,
        texHeight: number,
        texScale: number,
        collisionTiles: number[],
        tileFrames: { [key: number]: string }
    ) {
        this.scene = scene;
        this.mapSize = mapSize;

        this.isoWidth = isoWidth;
        this.isoHeight = isoHeight;
        this.isoScale = isoScale;

        this.texWidth = texWidth;
        this.texHeight = texHeight;
        this.texScale = texScale;

        this.collisionTiles = collisionTiles;
        this.tileFrames = tileFrames;

        // Genera i dati iniziali della mappa
        this.data = generateRandomMap(this.mapSize, Object.keys(this.tileFrames).length);
    }

    /**
     * Restituisce i dati della mappa come matrice bidimensionale.
     * 
     * @returns I dati della mappa.
     */
    getMapData(): number[][] {
        return this.data;
    }

    /**
     * Crea il tilemap della mappa, aggiungendo i tile alla scena.
     */
    createTilemap(): void {
        const offsetX = (this.mapSize - 1) * (this.isoWidth * this.isoScale / 2);

        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.isoWidth * this.isoScale / 2) + offsetX;
                const isoY = (x + y) * (this.isoHeight * this.isoScale / 2);

                const frameKey = this.tileFrames[this.data[y][x]];
                if (!frameKey) continue;

                if (this.collisionTiles.includes(this.data[y][x])) {
                    this.createMatterTile(isoX, isoY, frameKey);
                } else {
                    this.scene.add.image(isoX, isoY, 'tileset', frameKey)
                        .setScale(this.texScale)
                        .setOrigin(0.5, 0.5);
                }
            }
        }
    }

    /**
     * Crea un tile statico con corpo fisico per i tile che causano collisioni.
     * 
     * @param isoX Coordinata X isometrica del tile.
     * @param isoY Coordinata Y isometrica del tile.
     * @param frameKey La chiave del frame associata al tile.
     */
    private createMatterTile(isoX: number, isoY: number, frameKey: string): void {
        const sprite = this.scene.matter.add.sprite(
            isoX, 
            isoY, 
            'tileset', 
            frameKey,
            { isStatic: true }
        );

        sprite.setScale(this.texScale);

        const realW = this.texWidth * this.texScale;
        const realH = this.texHeight * this.texScale;

        sprite.setBody({
            type: 'fromVertices',
            verts: [
                { x: 0,   y: -32 },  // Vertice superiore
                { x: 64,  y: 0   },  // Vertice a destra
                { x: 0,   y: 32  },  // Vertice inferiore
                { x: -64, y: 0   }   // Vertice a sinistra
            ],
            width: realW,
            height: realH
        }, {
            isStatic: true
        });

        sprite.setOrigin(0.5, 0.3);

        sprite.setData('tileType', 'water');
    }
}
