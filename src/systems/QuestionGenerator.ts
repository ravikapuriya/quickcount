import Phaser from 'phaser'
import type { DifficultyRules, Operation, Question } from '../data/types'
import type { RNG } from './RNG'

function weightedRandom(opWeights: Partial<Record<Operation, number>>, rnd: RNG | null): Operation {
    const entries = Object.entries(opWeights) as [Operation, number][]
    const sum = entries.reduce((a, [, w]) => a + (w ?? 0), 0) || 1
    let r = (rnd ? rnd() : Math.random()) * sum
    for (const [op, w] of entries) {
        r -= (w ?? 0)
        if (r <= 0) return op
    }
    return '+'
}

function makeChoices(answer: number, count = 4, rnd: RNG | null): number[] {
    const set = new Set<number>([answer])
    while (set.size < count) {
        const delta = (rnd ? Math.floor(rnd() * 19) - 9 : Phaser.Math.Between(-9, 9)) || 1
        set.add(answer + delta)
    }
    const arr = [...set]
    if (rnd) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rnd() * (i + 1))
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr.slice(0, count)
    }
    return Phaser.Utils.Array.Shuffle(arr).slice(0, count)
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }

export function makeQuestion(rules: DifficultyRules, rnd: RNG | null = null): Question {
    const op = weightedRandom(rules.opWeights, rnd)
    const between = (min: number, max: number) => rnd ? Math.floor(rnd() * (max - min + 1)) + min : Phaser.Math.Between(min, max)
    const a = between(rules.min, rules.max)
    const b = between(rules.min, rules.max)
    let text = ''
    let ans = 0

    const pick = (p: number) => (rnd ? rnd() : Math.random()) < p

    if (pick(rules.multiStepChance ?? 0)) {
        const c = between(rules.min, rules.max)
        const ops: Operation[] = ['+', '-', '×', '÷']
        const op2 = ops[between(0, ops.length - 1)]
        const evalOp = (x: number, o: Operation, y: number) => o === '+' ? x + y : o === '-' ? x - y : o === '×' ? x * y : Math.floor(x / (y || 1))
        const step1 = evalOp(a, op, b)
        ans = evalOp(step1, op2, c)
        text = `(${a} ${op} ${b}) ${op2} ${c} = ?`
    } else {
        switch (op) {
            case '+': ans = a + b; text = `${a} + ${b} = ?`; break
            case '-': ans = a - b; text = `${a} - ${b} = ?`; break
            case '×': ans = a * b; text = `${a} × ${b} = ?`; break
            case '÷':
                const prod = a * b
                ans = a
                text = `${prod} ÷ ${b} = ?`
                break
        }
    }

    if (!rules.negativeAllowed) ans = clamp(ans, -999, 999)

    return {
        id: Math.random().toString(36).slice(2),
        text,
        answer: ans,
        choices: makeChoices(ans, 4, rnd),
        tags: [],
        difficulty: Math.floor((rules.max - 10) / 9)
    }
}
