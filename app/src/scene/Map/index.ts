import * as PIXI from 'pixi.js';
import { matrix, multiply } from "mathjs";

import Block from '@app/entities/Block';
import { ANIMATION, TYPE } from '@app/entities/Block/types';

export default class Map extends PIXI.Container {

    constructor(
        position: { x: number, y: number },
    ) {
        super({ ...position })
    }

    private _idToAnimation(id: number) {
        if (TYPE.TERRAIN === id) return ANIMATION.TERRAIN
        else if (TYPE.SAND === id) return ANIMATION.SAND
        else if (TYPE.WATER === id) return ANIMATION.WATER
        else if (TYPE.GRASS === id) return ANIMATION.GRASS
        else if (TYPE.SNOW === id) return ANIMATION.SNOW
        else return ANIMATION.STONE
    }

    private _toIsometric(x: number, y: number) {
        // the weights as explanined in the youtube video
        const isometricWeights = matrix([
            [0.5, 0.29],
            [-0.5, 0.29]
        ]);

        // coordinatex times the size of the block 18 * 4 = 72
        // as it's scaled 4x
        const coordinate = matrix([
            [x * 128, y * 128]
        ]);

        const [isometricCoordinate] = multiply(coordinate, isometricWeights).toArray();
        return isometricCoordinate as number[];
    }

    public async init(map: string) {
        const demoMapDebug = await import(`./../../../public/assets/maps/${map}.json`)

        for (let indexLayer = 0; indexLayer <= demoMapDebug.layers.length - 1; indexLayer++) {
            const layer = demoMapDebug.layers[indexLayer].data;
            let row = 0, column = 0

            for (let index = 0; index <= layer.length - 1; index++) {
                if (column === demoMapDebug.width - 1) row = row + 1
                column = (index % demoMapDebug.width)

                const id = layer[index];
                if (id != 0) {
                    const [x, y] = this._toIsometric((column + 1), (row + 1))

                    const block = new Block(
                        { pack: await Block.loadDynamicAssets(), reset: this._idToAnimation(id) },
                        { x, y },
                        { type: TYPE.TERRAIN }
                    )

                    this.addChild(block);
                }
            }
        }
    }
}
