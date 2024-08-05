import Character from "@app/entities/Character";

export default class Player extends Character {

    public routine(deltaTime: number) {
        const speed: number = deltaTime / 10;

        if (this.state.animation.movements.moveRight) {
            // this.x += speed * 24
            // this.y -= speed * 12
            this.y += speed * 12
            this.x += speed * 24

            if (this.playing === false) {
                this.textures = this.assets.walkRight;
                this.state.animation.current = 'walkRight'
                this.animationSpeed = 0.35;
                this.play()
            }

        } else if (this.state.animation.movements.moveLeft) {
            // this.x -= speed * 24
            // this.y += speed * 12
            this.x -= speed * 24
            this.y -= speed * 12

            if (this.playing === false) {
                this.textures = this.assets.walkLeft;
                this.state.animation.current = 'walkLeft'
                this.animationSpeed = 0.35;
                this.play()
            }

        } else if (this.state.animation.movements.moveUp) {
            // this.y -= speed * 12
            // this.x -= speed * 24
            this.x += speed * 24
            this.y -= speed * 12

            if (this.playing === false) {
                // this.textures = this.assets.walkUp;
                // this.state.animation.current = 'walkUp'
                this.textures = this.assets.walkRight;
                this.state.animation.current = 'walkRight'
                this.animationSpeed = 0.35;
                this.play()
            }

        } else if (this.state.animation.movements.moveDown) {
            // this.y += speed * 12
            // this.x += speed * 24
            this.y += speed * 12
            this.x -= speed * 24

            if (this.playing === false) {
                // this.textures = this.assets.walkDown;
                // this.state.animation.current = 'walkDown'
                this.textures = this.assets.walkLeft;
                this.state.animation.current = 'walkLeft'
                this.animationSpeed = 0.35;
                this.play()
            }

        } else if (this.state.animation.actions.jump.isJump) {
            if (this.playing === false) {
                this.animationSpeed = 0.2;

                switch (this.state.animation.current) {
                    case "walkRight": {
                        this.textures = this.assets.jumpRight;
                        break;
                    }
                    case "walkLeft": {
                        this.textures = this.assets.jumpLeft;
                        break;
                    }
                    case "walkUp": {
                        this.textures = this.assets.jumpUp;
                        break;
                    }
                    case "walkDown": {
                        this.textures = this.assets.jumpDown;
                        break;
                    }
                }

                this.play()

                setTimeout(() => {
                    this.state.animation.actions.jump.isJump = false
                    this.textures = this.assets[this.state.animation.current!];
                }, 400)
            }

        } else {
            this.stop()
            this.currentFrame = 0
            this.textures = this.assets.walkDown;
            this.state.animation.current = 'walkDown'
        }
    }

}