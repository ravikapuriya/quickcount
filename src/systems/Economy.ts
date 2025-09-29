export const Economy = {
    coinsPerCorrect: 2,
    coinsPerStreak(n: number) { return n >= 5 ? 5 : 0 },
    coinsOnGameOver(score: number) { return Math.floor(score / 10) },
}
