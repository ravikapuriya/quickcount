import Phaser from 'phaser'
import { Save } from '../systems/Save'
import { Economy } from '../systems/Economy'
import { dailyInfo } from '../systems/Daily'
import { Sound } from '../systems/Sound'
import { ASSET_KEYS, SCENE_KEYS } from '../data/gameConfigs'

export class GameOverScene extends Phaser.Scene {
    constructor() { super(SCENE_KEYS.GAMEOVER) }

    async create(data: { score: number, mode?: 'classic' | 'daily' }) {
        const { width, height } = this.scale
        const save = await Save.get()
        const modeKey = data.mode === 'daily' ? `daily_${dailyInfo().dd}/${dailyInfo().MM}/${dailyInfo().yyyy}` : 'classic60'

        const best = Math.max(save.bestScores[modeKey] ?? 0, data.score)
        save.bestScores[modeKey] = best

        let coins = Economy.coinsOnGameOver(data.score)
        if (data.mode === 'daily') coins += 20
        save.coins += coins
        await Save.set(save)

        this.add.text(width / 2, 220, 'Results', {
            font: '64px MuseoSansRounded', color: '#00559C', fontStyle: 'bold'
        }).setOrigin(0.5)
        this.add.text(width / 2, 360, `Score: ${data.score}`, {
            font: '48px MuseoSansRounded', color: '#00559C'
        }).setOrigin(0.5)
        this.add.text(width / 2, 430, `Best (${modeKey}): ${best}`, {
            font: '32px MuseoSansRounded', color: '#3a3a3a'
        }).setOrigin(0.5)
        this.add.text(width / 2, 500, `Coins Earned: +${coins}`, {
            font: '32px MuseoSansRounded', color: '#3a3a3a'
        }).setOrigin(0.5)

        const playAgain = this.add.image(width / 2, height - 250, 'btn').setInteractive({ useHandCursor: true })
        this.add.text(playAgain.x, playAgain.y, 'Play Again', {
            font: '32px MuseoSansRounded', color: '#fff'
        }).setOrigin(0.5)
        playAgain.on('pointerdown', () => {
            Sound.play('click');
            this.scene.start(SCENE_KEYS.GAME, { mode: data.mode ?? 'classic' })
        })

        const menu = this.add.image(width / 2, height - 120, 'btn-outline').setInteractive({ useHandCursor: true })
        this.add.text(menu.x, menu.y, 'Menu', {
            font: '28px MuseoSansRounded', color: '#58a6ff'
        }).setOrigin(0.5)
        menu.on('pointerdown', () => {
            Sound.play('click');
            this.scene.start(SCENE_KEYS.MENU)
        })

        // Sprite-based confetti
        for (let i = 0; i < 24; i++) {
            const x = Math.random() * width
            const y = -Math.random() * 200

            // Random frame from confetti spritesheet (36 frames total)
            const randomFrame = Math.floor(Math.random() * 36)
            const confetti = this.add.sprite(x, y, ASSET_KEYS.CONFETTI, randomFrame)

            // Random scale and rotation
            const scale = 0.3 + Math.random() * 0.4 // Scale between 0.3 and 0.7
            confetti.setScale(scale)
            confetti.setRotation(Math.random() * Math.PI * 2)

            // Animation with rotation and falling
            this.tweens.add({
                targets: confetti,
                y: height + 100,
                rotation: confetti.rotation + (Math.PI * 4) + (Math.random() - 0.5) * Math.PI * 2,
                duration: 2200 + Math.random() * 800,
                ease: 'Power2',
                onComplete: () => confetti.destroy()
            })

            // Side-to-side drift
            this.tweens.add({
                targets: confetti,
                x: confetti.x + (Math.random() - 0.5) * 200,
                duration: 1000 + Math.random() * 1000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 1
            })
        }
    }
}
