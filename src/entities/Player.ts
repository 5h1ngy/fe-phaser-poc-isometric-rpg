// src/entities/Player.ts
export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private velocityX: number = 0;
    private velocityY: number = 0;

    // Dichiarazione esplicita del tipo `body`
    declare body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        // Aggiungi il player alla scena con la fisica abilitata
        scene.physics.add.existing(this);

        // Configura il corpo fisico
        this.body.setSize(32, 48);
        // Commentiamo per evitare che i confini del mondo blocchino il player
        // this.body.setCollideWorldBounds(true);

        // Aggiungi il player alla scena
        scene.add.existing(this);
        this.setOrigin(0.5, 0.5).setScale(1.5);

        // Configura gli input da tastiera (W,A,S,D + frecce)
        this.cursors = scene.input.keyboard!.createCursorKeys();
        scene.input.keyboard!.addKeys('W,A,S,D');
    }

    createAnimations(scene: Phaser.Scene) {
        scene.anims.create({
            key: 'stand',
            frames: [{ key: 'player', frame: 'walk_down_0' }],
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkRight',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_right_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkLeft',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_left_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkUp',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_left_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: 'walkDown',
            frames: scene.anims.generateFrameNames('player', { prefix: 'walk_right_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update(scene: Phaser.Scene, speed: number) {
        this.velocityX = 0;
        this.velocityY = 0;

        // Tasti A o freccia sinistra
        if (this.cursors.left?.isDown || scene.input.keyboard!.keys[65]?.isDown) {
            this.velocityX = -speed;
            this.velocityY = speed / 2;
            if (this.anims.currentAnim?.key !== 'walkLeft') {
                this.play('walkLeft', true);
            }
        }
        // Tasti D o freccia destra
        else if (this.cursors.right?.isDown || scene.input.keyboard!.keys[68]?.isDown) {
            this.velocityX = speed;
            this.velocityY = -speed / 2;
            if (this.anims.currentAnim?.key !== 'walkRight') {
                this.play('walkRight', true);
            }
        }
        // Tasti W o freccia su
        else if (this.cursors.up?.isDown || scene.input.keyboard!.keys[87]?.isDown) {
            this.velocityX = -speed;
            this.velocityY = -speed / 2;
            if (this.anims.currentAnim?.key !== 'walkUp') {
                this.play('walkUp', true);
            }
        }
        // Tasti S o freccia giù
        else if (this.cursors.down?.isDown || scene.input.keyboard!.keys[83]?.isDown) {
            this.velocityX = speed;
            this.velocityY = speed / 2;
            if (this.anims.currentAnim?.key !== 'walkDown') {
                this.play('walkDown', true);
            }
        }
        // Nessun input: stand
        else {
            if (this.anims.currentAnim?.key !== 'stand') {
                this.play('stand', true);
            }
        }

        // Applica la velocità
        this.body.setVelocity(this.velocityX, this.velocityY);
    }

    stopMovement() {
        this.body.setVelocity(0, 0);
        if (this.anims.currentAnim?.key !== 'stand') {
            this.play('stand', true);
        }
    }
}
