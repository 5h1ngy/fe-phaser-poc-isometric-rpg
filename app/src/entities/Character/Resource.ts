import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { Spritesheet } from 'pixi.js';

import State from "./State";
import lpcNakedMeta from "@assets/spritesheet/lpc_naked.json";

export default class Resource extends State {

    public assets: Record<string | number, PIXI.Texture[]>;

    constructor(animations: Record<string | number, PIXI.Texture[]>, reset: string) {
        super(animations[reset]);

        this.assets = animations;
    }

    public static async loadDynamicAssets() {
        const { lpcNaked: lpcNakedAsset } = await Assets.loadBundle('spritesheet');
        const spritesheet = new Spritesheet(lpcNakedAsset, <PIXI.SpritesheetData>lpcNakedMeta)

        spritesheet.parse();

        return spritesheet.animations;
    }

}