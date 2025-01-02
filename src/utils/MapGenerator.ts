// src/utils/MapGenerator.ts
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
                // Inserisci un blocco casuale (diverso da acqua)
                row.push(Math.floor(Math.random() * (tileTypes - 1)) + 1);
            }
        }
        map.push(row);
    }

    // Genera piccoli laghetti casuali
    const numberOfLakes = Math.floor(mapSize / 5);
    for (let i = 0; i < numberOfLakes; i++) {
        const lakeCenterX = Math.floor(Math.random() * (mapSize - 4)) + 2;
        const lakeCenterY = Math.floor(Math.random() * (mapSize - 4)) + 2;

        const lakeSize = Math.floor(Math.random() * 3) + 2; // da 2x2 a 4x4
        for (let y = lakeCenterY - 1; y < lakeCenterY + lakeSize; y++) {
            for (let x = lakeCenterX - 1; x < lakeCenterX + lakeSize; x++) {
                if (x > 0 && x < mapSize - 1 && y > 0 && y < mapSize - 1) {
                    map[y][x] = 0; // acqua
                }
            }
        }
    }

    return map;
}
