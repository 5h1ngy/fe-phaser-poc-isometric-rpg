import * as PIXI from 'pixi.js';
import Resource from "./Resource";

export default class Character extends Resource {

    constructor(
        animations: { pack: Record<string | number, PIXI.Texture[]>, reset: string },
        position: { x: number, y: number }
    ) {
        super(animations.pack, animations.reset);

        this.state.animation.current = animations.reset;
        this.x = position.x;
        this.y = position.y;
    }

    public routine(deltaTime: number) {
        const speed: number = deltaTime / 10;
        console.log(speed)
    }

}