import type { DifficultyRules } from '../data/types'

export class DifficultyManager {
    private streak = 0
    private rules: DifficultyRules

    constructor() {
        this.rules = {
            opWeights: { '+': 1, '-': 0.7, '×': 0.8, '÷': 0.5 },
            min: 1,
            max: 10,
            timePerQ: 8,
            negativeAllowed: false,
            multiStepChance: 0.0
        }
    }

    getRules() { return this.rules }

    report(correct: boolean) {
        this.streak = correct ? Math.min(this.streak + 1, 10) : 0
        const delta = correct ? +1 : -1
        const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
        this.rules.max = clamp(this.rules.max + delta, 10, 99)
        this.rules.timePerQ = clamp(this.rules.timePerQ + (correct ? -0.2 : +0.4), 4, 12)
        if (this.streak >= 7) this.rules.multiStepChance = 0.2
        if (this.streak === 0) this.rules.multiStepChance = 0.0
    }
}
