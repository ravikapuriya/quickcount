export type Operation = '+' | '-' | '×' | '÷'

export interface Question {
    id: string
    text: string
    answer: number
    choices: number[]
    tags: string[]
    difficulty: number
}

export interface DifficultyRules {
    opWeights: Partial<Record<Operation, number>>
    min: number
    max: number
    timePerQ: number
    negativeAllowed?: boolean
    multiStepChance?: number
}

export interface PowerUp {
    key: 'freeze' | 'fifty_fifty' | 'slow'
    uses: number
}

export interface SaveData {
    coins: number
    xp: number
    cosmetics: string[]
    bestScores: Record<string, number>
    settings: { sfx: boolean; music: boolean; lang: string; skin?: string }
}
