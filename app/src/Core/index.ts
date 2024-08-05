import * as PIXI from 'pixi.js';
import { Application, Assets } from 'pixi.js';
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

import manifest from "@assets/manifest.json";
import Keyboard from "./inputOutput/Keyboard";
import Player from "@app/entities/Player";
import Map from "@app/scene/Map";

export default class Core extends Application {

    public static SCREEN_WIDTH = 1920
    public static SCREEN_HEIGHT = 905

    private keyboard: Keyboard = new Keyboard();

    constructor() {
        super()

        // register the plugin
        gsap.registerPlugin(PixiPlugin);
        // give the plugin a reference to the PIXI object
        PixiPlugin.registerPIXI(PIXI);
    }

    public async loadScene() {
        // assets
        await Assets.init({ manifest });

        // entities
        const map = new Map({ x: 0, y: -500 })
        map.init("test_basic_blocks");
        this.stage.addChild(map);

        const player = new Player(
            { pack: await Player.loadDynamicAssets(), reset: "walkRight" },
            { x: (map.width / 2), y: (map.height / 2) }
        )
        this.stage.addChild(player);

        // camera
        this.stage.position.x = player.x
        this.stage.position.y = player.y

        // register keyboard
        this.keyboard.bind(player.state)
    }

    public async run() {
        let elapsed = 0.0;

        this.ticker.add((ticker) => {
            elapsed += ticker.deltaTime;

            const player = this.stage.children.find(child => child instanceof Player)
            const map = this.stage.children.find(child => child instanceof Map)
            if (player && map) {
                player.routine(ticker.deltaTime);
                this.stage.position.x = (player.x * -1) + (Core.SCREEN_WIDTH / 2)
                this.stage.position.y = (player.y * -1) + (Core.SCREEN_HEIGHT / 2)
            }
        });

    }
}
