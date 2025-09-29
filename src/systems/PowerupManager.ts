import type { PowerUp } from '../data/types'
import Phaser from 'phaser'

export class PowerupManager extends Phaser.Events.EventEmitter {
    freeze = 3
    fifty = 3
    slow = 3
    isFrozen = false
    slowUntil = 0

    constructor() { super() }

    useFreeze(now: number) {
        if (this.freeze <= 0) return false
        this.freeze -= 1
        this.isFrozen = true
        this.emit('freeze', true)
        return true
    }

    unfreeze() {
        if (this.isFrozen) {
            this.isFrozen = false
            this.emit('freeze', false)
        }
    }

    useFifty() {
        if (this.fifty <= 0) return false
        this.fifty -= 1
        this.emit('fifty')
        return true
    }

    useSlow(now: number, durationMs = 5000) {
        if (this.slow <= 0) return false
        this.slow -= 1
        this.slowUntil = now + durationMs
        this.emit('slow', { until: this.slowUntil })
        return true
    }

    isSlowActive(now: number) {
        return now < this.slowUntil
    }

    getAll(): PowerUp[] {
        return [
            { key: 'freeze', uses: this.freeze },
            { key: 'fifty_fifty', uses: this.fifty },
            { key: 'slow', uses: this.slow }
        ]
    }
}
