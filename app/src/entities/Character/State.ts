
import { AnimatedSprite } from 'pixi.js';

export interface IState {
    animation: {
        current: string | undefined,

        movements: {
            moveRight: boolean,
            moveLeft: boolean,
            moveUp: boolean,
            moveDown: boolean,
        },

        actions: {
            jump: {
                isJump: boolean,
                jumpUp: boolean,
                jumpLeft: boolean,
                jumpDown: boolean,
                jumpRight: boolean,
            }
        },
    }
}

export default class State extends AnimatedSprite {

    public state: IState = {
        animation: {
            current: undefined,
            movements: {
                moveRight: false,
                moveLeft: false,
                moveUp: false,
                moveDown: false,
            },
            actions: {
                jump: {
                    isJump: false,
                    jumpUp: false,
                    jumpLeft: false,
                    jumpDown: false,
                    jumpRight: false,
                }
            }
        }
    }

}