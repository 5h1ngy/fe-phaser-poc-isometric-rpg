import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { Spritesheet } from 'pixi.js';

import aiBlocksMeta from "@assets/tileset/ai_blocks.json";
import { ANIMATION } from "./types";
import State from "./State";

export default class Resource extends State {

    public assets: Record<string | number, PIXI.Texture[]>;

    constructor(
        animations: Record<string | number, PIXI.Texture[]>,
        reset: ANIMATION
    ) {
        super(animations[reset]);

        this.assets = animations;
    }

    public static async loadDynamicAssets() {
        const { aiBlocks: aiBlocksAsset } = await Assets.loadBundle('spritesheet');

        const spritesheet = new Spritesheet(aiBlocksAsset, <PIXI.SpritesheetData>aiBlocksMeta)
        spritesheet.parse();

        return spritesheet.animations;
    }

}