/**
 * Generates a random map with specified dimensions and tile types.
 * 
 * @param mapSize - The size of the map (width and height in tiles).
 * @param tileTypes - The number of unique tile types, where 0 is reserved for water.
 * @returns A 2D array representing the map, where each cell contains a tile type index.
 */
export function generateRandomMap(mapSize: number, tileTypes: number): number[][] {
    const map: number[][] = [];

    // Create the initial map
    for (let y = 0; y < mapSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < mapSize; x++) {
            // Set water (tile type 0) for border tiles
            if (x === 0 || y === 0 || x === mapSize - 1 || y === mapSize - 1) {
                row.push(0); // Water tile
            } else {
                // Assign a random tile type (excluding water)
                row.push(Math.floor(Math.random() * (tileTypes - 1)) + 1);
            }
        }
        map.push(row);
    }

    // Generate small lakes randomly
    const numberOfLakes = Math.floor(mapSize / 5);
    for (let i = 0; i < numberOfLakes; i++) {
        const lakeCenterX = Math.floor(Math.random() * (mapSize - 4)) + 2;
        const lakeCenterY = Math.floor(Math.random() * (mapSize - 4)) + 2;

        const lakeSize = Math.floor(Math.random() * 3) + 2; // Size between 2x2 and 4x4
        for (let y = lakeCenterY - 1; y < lakeCenterY + lakeSize; y++) {
            for (let x = lakeCenterX - 1; x < lakeCenterX + lakeSize; x++) {
                // Ensure the lake is within map boundaries
                if (x > 0 && x < mapSize - 1 && y > 0 && y < mapSize - 1) {
                    map[y][x] = 0; // Water tile
                }
            }
        }
    }

    return map;
}
