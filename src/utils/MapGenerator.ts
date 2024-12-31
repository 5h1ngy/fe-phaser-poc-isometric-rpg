export function generateRandomMap(size: number, tileTypes: number): number[][] {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * tileTypes))
    );
}
