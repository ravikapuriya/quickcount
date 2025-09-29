export type RNG = () => number;

export function mulberry32(seed: number): RNG {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    }
}

export function seededBetween(rng: RNG, min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min;
}
