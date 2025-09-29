import { mulberry32, type RNG } from './RNG'

export interface DailyInfo {
    yyyy: number,
    MM: number,
    dd: number,
    seed: number
}

export function getISTDate(): Date {
    const now = new Date()
    const ist = new Date(now.getTime() + (330 - now.getTimezoneOffset()) * 60000)
    return ist
}

export function dailyInfo(): DailyInfo {
    const d = getISTDate()
    const yyyy = d.getUTCFullYear()
    const mm = d.getUTCMonth() + 1
    const dd = d.getUTCDate()
    const tag = `${yyyy}${String(mm).padStart(2, '0')}${String(dd).padStart(2, '0')}`
    const seed = Number(tag) ^ 0xA5A5A5
    return { yyyy: yyyy, MM: mm, dd: dd, seed: seed }
}

export function dailyRNG(): RNG {
    const { seed } = dailyInfo()
    return mulberry32(seed)
}
