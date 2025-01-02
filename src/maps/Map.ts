import Phaser from 'phaser';
import { generateRandomMap } from '@/utils/MapGenerator';

export class Map {
    private scene: Phaser.Scene;
    private data: number[][] = [];
    private mapSize: number;

    private isoWidth: number;
    private isoHeight: number;
    private isoScale: number;

    private texWidth: number;
    private texHeight: number;
    private texScale: number;

    private collisionTiles: number[];

    private tileFrames: { [key: number]: string };

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

        this.data = generateRandomMap(this.mapSize, Object.keys(this.tileFrames).length);
    }

    getMapData() {
        return this.data;
    }

    createTilemap() {
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

    private createMatterTile(isoX: number, isoY: number, frameKey: string) {
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
                { x: 0,   y: -32 },
                { x: 64,  y: 0   },
                { x: 0,   y: 32  },
                { x: -64, y: 0   }
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
