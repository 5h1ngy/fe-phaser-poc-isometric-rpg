import { AnimatedSprite } from 'pixi.js';
import { TYPE } from "@app/entities/Block/types";

export interface IState {
    type: TYPE | undefined,
    animation: {
        current: string | undefined,
    }
}

export default class State extends AnimatedSprite {

    public state: IState = {
        type: undefined,
        animation: {
            current: undefined,
        }
    }

}