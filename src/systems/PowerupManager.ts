import type { PowerUp } from '../data/types'
import Phaser from 'phaser'
import { Save } from './Save'

export class PowerupManager extends Phaser.Events.EventEmitter {
    freeze = 3
    fifty = 3
    slow = 3
    isFrozen = false
    slowUntil = 0

    constructor() {
        super()
        this.loadPowerups()
    }

    async loadPowerups() {
        const save = await Save.get()
        this.freeze = save.powerups.freeze
        this.fifty = save.powerups.fifty
        this.slow = save.powerups.slow
    }

    async savePowerups() {
        await Save.set({
            powerups: {
                freeze: this.freeze,
                fifty: this.fifty,
                slow: this.slow
            }
        })
    }

    async useFreeze(now: number) {
        if (this.freeze <= 0) return false
        this.freeze -= 1
        this.isFrozen = true
        this.emit('freeze', true)
        await this.savePowerups()
        return true
    }

    unfreeze() {
        if (this.isFrozen) {
            this.isFrozen = false
            this.emit('freeze', false)
        }
    }

    async useFifty() {
        if (this.fifty <= 0) return false
        this.fifty -= 1
        this.emit('fifty')
        await this.savePowerups()
        return true
    }

    async useSlow(now: number, durationMs = 5000) {
        if (this.slow <= 0) return false
        this.slow -= 1
        this.slowUntil = now + durationMs
        this.emit('slow', { until: this.slowUntil })
        await this.savePowerups()
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
