import { IState } from "@app/entities/Character/State";

export default class Keyboard {
    private _state: IState | undefined

    private _onKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
            case "KeyD": {
                this._state!.animation.movements.moveRight = true
                break;
            }
            case "KeyA": {
                this._state!.animation.movements.moveLeft = true
                break;
            }
            case "KeyW": {
                this._state!.animation.movements.moveUp = true
                break;
            }
            case "KeyS": {
                this._state!.animation.movements.moveDown = true
                break;
            }
            case "Space": {
                this._state!.animation.actions.jump.isJump = true
                break;
            }
        }
    }

    private _onKeyUp = (event: KeyboardEvent) => {
        switch (event.code) {
            case "KeyD": {
                this._state!.animation.movements.moveRight = false
                break;
            }
            case "KeyA": {
                this._state!.animation.movements.moveLeft = false
                break;
            }
            case "KeyW": {
                this._state!.animation.movements.moveUp = false
                break;
            }
            case "KeyS": {
                this._state!.animation.movements.moveDown = false
                break;
            }
        }
    }

    public bind(state: IState) {
        this._state! = state;

        document.body.addEventListener('keydown', this._onKeyDown)
        document.body.addEventListener('keyup', this._onKeyUp)
    }
}
