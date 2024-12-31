export function generateRandomMap(mapSize: number, tileTypes: number): number[][] {
    const map: number[][] = [];

    // Crea la mappa iniziale
    for (let y = 0; y < mapSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < mapSize; x++) {
            // Se è un bordo, imposta come acqua (0)
            if (x === 0 || y === 0 || x === mapSize - 1 || y === mapSize - 1) {
                row.push(0); // Blocco d'acqua
            } else {
                // Inserisci un blocco casuale diverso da acqua
                row.push(Math.floor(Math.random() * (tileTypes - 1)) + 1);
            }
        }
        map.push(row);
    }

    // Genera piccoli laghetti casuali all'interno della mappa
    const numberOfLakes = Math.floor(mapSize / 5); // Numero di laghi proporzionale alla dimensione della mappa
    for (let i = 0; i < numberOfLakes; i++) {
        const lakeCenterX = Math.floor(Math.random() * (mapSize - 4)) + 2; // Evita i margini
        const lakeCenterY = Math.floor(Math.random() * (mapSize - 4)) + 2;

        const lakeSize = Math.floor(Math.random() * 3) + 2; // Dimensione del lago (tra 2x2 e 4x4)
        for (let y = lakeCenterY - 1; y < lakeCenterY + lakeSize; y++) {
            for (let x = lakeCenterX - 1; x < lakeCenterX + lakeSize; x++) {
                if (x > 0 && x < mapSize - 1 && y > 0 && y < mapSize - 1) {
                    map[y][x] = 0; // Imposta il blocco come acqua
                }
            }
        }
    }

    return map;
}
