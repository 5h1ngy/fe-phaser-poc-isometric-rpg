import Phaser from 'phaser';

/**
 * Classe che rappresenta il giocatore.
 * Estende `Phaser.Physics.Matter.Sprite` per integrare il motore fisico Matter.js.
 */
export default class Player extends Phaser.Physics.Matter.Sprite {
    /** Oggetto per gestire i tasti di input */
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    /** Velocità lungo l'asse X */
    private velocityX: number = 0;

    /** Velocità lungo l'asse Y */
    private velocityY: number = 0;

    /**
     * Costruttore della classe Player.
     * 
     * @param scene La scena di Phaser a cui il giocatore appartiene.
     * @param x La posizione X iniziale del giocatore.
     * @param y La posizione Y iniziale del giocatore.
     * @param texture La chiave della texture del giocatore.
     */
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene.matter.world, x, y, texture);

        // Aggiunge lo sprite alla scena.
        scene.add.existing(this);

        // Configura il corpo fisico del giocatore.
        this.setRectangle(32, 48);
        this.setFixedRotation();
        this.setFrictionAir(0.02);
        this.setOrigin(0.5, 0.5).setScale(1.5);

        // Configura i tasti di input.
        this.cursors = scene.input.keyboard!.createCursorKeys();
        scene.input.keyboard!.addKeys('W,A,S,D');
    }

    /**
     * Crea le animazioni per il giocatore.
     * 
     * @param scene La scena di Phaser in cui vengono registrate le animazioni.
     */
    createAnimations(scene: Phaser.Scene): void {
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

    /**
     * Aggiorna lo stato del giocatore ogni frame.
     * Gestisce il movimento e le animazioni in base ai tasti premuti.
     * 
     * @param scene La scena di Phaser.
     * @param speed La velocità di movimento del giocatore.
     */
    update(scene: Phaser.Scene, speed: number): void {
        this.velocityX = 0;
        this.velocityY = 0;

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

        this.setVelocity(this.velocityX, this.velocityY);
    }

    /**
     * Ferma il movimento del giocatore e ripristina l'animazione di stand.
     */
    stopMovement(): void {
        this.setVelocity(0, 0);
        if (this.anims.currentAnim?.key !== 'stand') {
            this.play('stand', true);
        }
    }
}
