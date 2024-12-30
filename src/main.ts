// Importazione del modulo Phaser
import Phaser from 'phaser';

/**
 * Classe principale che rappresenta la scena di gioco.
 * Contiene la logica di creazione, aggiornamento e gestione degli eventi della scena.
 */
class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite; // Riferimento al giocatore
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // Riferimento agli input da tastiera
    private mapSize = 20; // Dimensione della mappa in termini di numero di tile
    private tileSize = 128; // Dimensione di ogni tile (in pixel) per proiezione isometrica
    private mapData: number[][] = []; // Matrice bidimensionale per i dati della mappa
    private resizing = false; // Flag per prevenire loop infiniti durante il resize
    private tileFrames: { [key: number]: string } = {
        // Associazione di ID numerici a nomi dei frame dei tile
        0: 'water_0',
        1: 'stone_0',
        2: 'terrain_0',
        3: 'sand_0',
        4: 'grass_0',
        5: 'snow_0'
    };

    constructor() {
        super('MainScene'); // Chiama il costruttore della classe base Phaser.Scene con il nome della scena
        this.debugLog('constructor', 'MainScene initialized.');
    }

    /**
     * Precaricamento delle risorse di gioco, come immagini e animazioni.
     */
    preload() {
        this.debugLog('preload', 'Starting asset loading.');
        // Caricamento delle immagini del tileset e del giocatore
        this.load.atlas('tileset', 'public/assets/tileset/ai_blocks.png', 'public/assets/tileset/ai_blocks.json');
        this.load.atlas('player', 'public/assets/spritesheet/lpc_naked.png', 'public/assets/spritesheet/lpc_naked.json');
        this.debugLog('preload', 'Assets loaded successfully.');
    }

    /**
     * Creazione iniziale della scena, inclusa la mappa, il giocatore e gli input.
     */
    create() {
        this.debugLog('create', 'Starting scene creation.');

        // Genera la mappa casuale e crea il tilemap
        this.generateRandomMap();
        this.createTilemap();

        // Posizionamento iniziale del giocatore
        const startX = (this.mapSize - 1) * (this.tileSize / 2);
        const startY = (this.mapSize - 1) * (this.tileSize / 4);
        this.player = this.add.sprite(startX, startY, 'player'); // Crea lo sprite del giocatore
        this.player.setOrigin(0.5, 0.5); // Imposta l'origine al centro
        this.player.setScale(1.5); // Ridimensiona il giocatore per visibilità
        this.debugLog('create', 'Player sprite created at initial position.');
        this.createPlayerAnimations(); // Crea le animazioni per il giocatore

        // Configura gli input da tastiera
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.input.keyboard!.addKeys('W,A,S,D'); // Aggiunge anche i tasti WASD come input
        this.debugLog('create', 'Input keys configured.');

        // Configura la scala e la telecamera
        this.scale.on('resize', this.handleResize, this); // Aggiunge un listener per il ridimensionamento
        this.handleResize({ width: window.innerWidth, height: window.innerHeight }); // Applica un ridimensionamento iniziale
        this.cameras.main.startFollow(this.player); // La telecamera segue il giocatore
        this.cameras.main.setZoom(1); // Configura lo zoom della telecamera
        this.debugLog('create', 'Camera and scaling configured.');
    }

    /**
     * Metodo che viene chiamato ad ogni frame per aggiornare la logica di gioco.
     */
    update() {
        const speed = 100; // Velocità del giocatore
        let velocityX = 0; // Velocità lungo l'asse X
        let velocityY = 0; // Velocità lungo l'asse Y

        // Controlla l'input da tastiera e aggiorna la velocità del giocatore
        if (this.cursors.left?.isDown || this.input.keyboard!.keys[65]?.isDown) { // Movimento a sinistra (tasto sinistro o 'A')
            velocityX = -speed;
            velocityY = speed / 2;
            this.player.play('walkLeft', true); // Riproduci animazione camminata sinistra
        } else if (this.cursors.right?.isDown || this.input.keyboard!.keys[68]?.isDown) { // Movimento a destra (tasto destro o 'D')
            velocityX = speed;
            velocityY = -speed / 2;
            this.player.play('walkRight', true); // Riproduci animazione camminata destra
        } else if (this.cursors.up?.isDown || this.input.keyboard!.keys[87]?.isDown) { // Movimento verso l'alto ('W')
            velocityX = -speed;
            velocityY = -speed / 2;
            this.player.play('walkUp', true); // Riproduci animazione camminata su
        } else if (this.cursors.down?.isDown || this.input.keyboard!.keys[83]?.isDown) { // Movimento verso il basso ('S')
            velocityX = speed;
            velocityY = speed / 2;
            this.player.play('walkDown', true); // Riproduci animazione camminata giù
        } else {
            this.player.stop(); // Ferma il giocatore se non ci sono input
        }

        // Aggiorna la posizione del giocatore secondo una proiezione isometrica
        this.player.x += velocityX * (1 / this.game.loop.actualFps);
        this.player.y += velocityY * (1 / this.game.loop.actualFps);
    }

    /**
     * Genera una mappa casuale come matrice bidimensionale.
     */
    private generateRandomMap() {
        this.debugLog('generateRandomMap', 'Generating random map data.');
        this.mapData = Array.from({ length: this.mapSize }, () =>
            Array.from({ length: this.mapSize }, () => Math.floor(Math.random() * 6)) // Ogni valore rappresenta un tipo di terreno
        );
        this.debugLog('generateRandomMap', 'Map data generated successfully.', this.mapData);
    }

    /**
     * Crea la mappa isometrica utilizzando i dati generati.
     */
    private createTilemap() {
        this.debugLog('createTilemap', 'Creating isometric tilemap.');
        const layer = this.add.layer(); // Crea un nuovo layer
        const offsetX = (this.mapSize - 1) * (this.tileSize / 2); // Calcola l'offset X per centrare la mappa
        const offsetY = 0; // Offset Y per la centratura verticale

        // Loop attraverso ogni riga e colonna della matrice della mappa
        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const isoX = (x - y) * (this.tileSize / 2) + offsetX; // Calcolo posizione isometrica X
                const isoY = (x + y) * (this.tileSize / 4) + offsetY; // Calcolo posizione isometrica Y
                const tileFrame = this.tileFrames[this.mapData[y][x]]; // Ottiene il nome del frame dal dato della mappa

                if (tileFrame) {
                    const tile = this.add.image(isoX, isoY, 'tileset', tileFrame); // Aggiunge il tile
                    tile.setOrigin(0.5, 0.5);
                    tile.setScale(1.5); // Scala il tile per visibilità
                    layer.add(tile); // Aggiunge il tile al layer
                }
            }
        }

        layer.setDepth(0); // Imposta la profondità del layer
        this.debugLog('createTilemap', 'Isometric tilemap created successfully.');
    }

    /**
     * Crea le animazioni del giocatore per i movimenti in tutte le direzioni.
     */
    private createPlayerAnimations() {
        this.debugLog('createPlayerAnimations', 'Creating player animations.');

        this.anims.create({
            key: 'walkRight',
            frames: this.anims.generateFrameNames('player', { prefix: 'walk_right_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkLeft',
            frames: this.anims.generateFrameNames('player', { prefix: 'walk_left_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkUp',
            frames: this.anims.generateFrameNames('player', { prefix: 'walk_up_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walkDown',
            frames: this.anims.generateFrameNames('player', { prefix: 'walk_down_', start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.debugLog('createPlayerAnimations', 'Player animations created successfully.');
    }

    /**
     * Gestisce il ridimensionamento della finestra di gioco.
     */
    private handleResize(gameSize: { width: number; height: number }) {
        if (this.resizing) return; // Previene chiamate ricorsive
        this.resizing = true;

        const { width, height } = gameSize;
        this.debugLog('handleResize', `Handling resize to width: ${width}, height: ${height}`);

        this.scale.resize(width, height); // Ridimensiona il canvas
        this.cameras.main.setViewport(0, 0, width, height); // Aggiorna la visualizzazione

        // Configura i limiti della telecamera
        this.cameras.main.setBounds(0, 0, this.mapSize * this.tileSize, this.mapSize * this.tileSize);

        this.resizing = false;
    }

    /**
     * Registra i messaggi di debug nella console.
     */
    private debugLog(method: string, message: string, data?: any) {
        const color = 'color: cyan';
        console.log(`%c[MainScene::${method}] ${message}`, color);
        if (data) console.log(`%c[MainScene::${method}] Data:`, color, data);
    }
}

// Configurazione principale del gioco
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Larghezza iniziale
    height: window.innerHeight, // Altezza iniziale
    scene: MainScene, // Scena principale
    physics: {
        default: 'arcade',
        arcade: { debug: false } // Fisica disabilitata per ora
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // Scala automaticamente alla dimensione della finestra
        autoCenter: Phaser.Scale.CENTER_BOTH // Centra automaticamente il canvas
    },
    parent: 'app', // ID dell'elemento DOM in cui inserire il canvas (opzionale)
};

// Inizializza il gioco con la configurazione definita
new Phaser.Game(config);

/**
 * Funzione per iniettare uno stile CSS per il canvas del gioco.
 */
function injectCSS() {
    const style = document.createElement('style');
    style.type = 'text/css';

    // Definizione dello stile CSS
    style.innerHTML = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: 100vw;
            height: 100vh;
        }

        canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
        }
    `;

    // Aggiunge lo stile al documento
    document.head.appendChild(style);
}

// Chiama questa funzione prima di inizializzare il gioco
injectCSS();
