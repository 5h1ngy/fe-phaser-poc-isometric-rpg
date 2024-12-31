export default class Player extends Phaser.GameObjects.Sprite {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private velocityX: number = 0;
    private velocityY: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        // Aggiungi il player alla scena
        scene.add.existing(this);
        this.setOrigin(0.5, 0.5).setScale(1.5);

        // Configura gli input da tastiera
        this.cursors = scene.input.keyboard!.createCursorKeys();
        scene.input.keyboard!.addKeys('W,A,S,D');
    }

    createAnimations(scene: Phaser.Scene) {
        scene.anims.create({
            key: 'stand',
            frames: [{ key: 'player', frame: 'walk_down_0' }], // Assicurati che "stand" sia un frame valido
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: 'walkRight',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_right_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: 'walkLeft',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_left_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: 'walkUp',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_left_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });

        scene.anims.create({
            key: 'walkDown',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_right_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    update(scene: Phaser.Scene, speed: number) {
        this.velocityX = 0;
        this.velocityY = 0;

        // Controlla gli input per il movimento
        if (this.cursors.left?.isDown || scene.input.keyboard!.keys[65]?.isDown) {
            this.velocityX = -speed;
            this.velocityY = speed / 2;
            if (this.anims.currentAnim?.key !== 'walkLeft') {
                this.play('walkLeft', true);
            }
        } else if (this.cursors.right?.isDown || scene.input.keyboard!.keys[68]?.isDown) {
            this.velocityX = speed;
            this.velocityY = -speed / 2;
            if (this.anims.currentAnim?.key !== 'walkRight') {
                this.play('walkRight', true);
            }
        } else if (this.cursors.up?.isDown || scene.input.keyboard!.keys[87]?.isDown) {
            this.velocityX = -speed;
            this.velocityY = -speed / 2;
            if (this.anims.currentAnim?.key !== 'walkUp') {
                this.play('walkUp', true);
            }
        } else if (this.cursors.down?.isDown || scene.input.keyboard!.keys[83]?.isDown) {
            this.velocityX = speed;
            this.velocityY = speed / 2;
            if (this.anims.currentAnim?.key !== 'walkDown') {
                this.play('walkDown', true);
            }
        } else {
            if (this.anims.currentAnim?.key !== 'stand') {
                this.play('stand', true);
            }
        }

        // Aggiorna la posizione del giocatore
        this.x += this.velocityX * (1 / scene.game.loop.actualFps);
        this.y += this.velocityY * (1 / scene.game.loop.actualFps);
    }

    stopMovement() {
        // Imposta velocità a 0 per bloccare il movimento
        this.velocityX = 0;
        this.velocityY = 0;
        
        if (this.anims.currentAnim?.key !== 'stand') {
            this.play('stand', true);
        }
    }
}
