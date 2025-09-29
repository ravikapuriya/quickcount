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

        // Background
        this.add.image(width / 2, height / 2, ASSET_KEYS.GAME_BG).setDisplaySize(width, height)

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

        // Rocket fire confetti from both bottom corners towards center
        const confettiFrames = [
            'confetti_red.png',
            'confetti_blue.png',
            'confetti_yellow.png',
            'confetti_green.png',
            'confetti_pink.png',
            'confetti_purple.png',
            'confetti_white.png'
        ]

        // Left rocket fire
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                // Starting position: bottom left corner
                const startX = 50 + Math.random() * 100
                const startY = height - 50 - Math.random() * 100

                // Target position: center area with some spread
                const targetX = width / 2 + (Math.random() - 0.5) * 300
                const targetY = height / 2 + (Math.random() - 0.5) * 200

                // Random confetti frame
                const randomFrame = confettiFrames[Math.floor(Math.random() * confettiFrames.length)]
                const confetti = this.add.sprite(startX, startY, ASSET_KEYS.CONFETTI, randomFrame)

                // Scale and initial rotation
                const scale = 0.4 + Math.random() * 0.3
                confetti.setScale(scale)
                confetti.setRotation(Math.random() * Math.PI * 2)

                // Rocket trajectory animation
                this.tweens.add({
                    targets: confetti,
                    x: targetX,
                    y: targetY,
                    rotation: confetti.rotation + Math.PI * 3,
                    duration: 800 + Math.random() * 400,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        // Explosion effect - small burst
                        this.tweens.add({
                            targets: confetti,
                            scale: confetti.scale * 1.5,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => confetti.destroy()
                        })
                    }
                })
            }, i * 50) // Stagger the launches
        }

        // Right rocket fire
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                // Starting position: bottom right corner
                const startX = width - 150 + Math.random() * 100
                const startY = height - 50 - Math.random() * 100

                // Target position: center area with some spread
                const targetX = width / 2 + (Math.random() - 0.5) * 300
                const targetY = height / 2 + (Math.random() - 0.5) * 200

                // Random confetti frame
                const randomFrame = confettiFrames[Math.floor(Math.random() * confettiFrames.length)]
                const confetti = this.add.sprite(startX, startY, ASSET_KEYS.CONFETTI, randomFrame)

                // Scale and initial rotation
                const scale = 0.4 + Math.random() * 0.3
                confetti.setScale(scale)
                confetti.setRotation(Math.random() * Math.PI * 2)

                // Rocket trajectory animation
                this.tweens.add({
                    targets: confetti,
                    x: targetX,
                    y: targetY,
                    rotation: confetti.rotation + Math.PI * 3,
                    duration: 800 + Math.random() * 400,
                    ease: 'Power2.easeOut',
                    onComplete: () => {
                        // Explosion effect - small burst
                        this.tweens.add({
                            targets: confetti,
                            scale: confetti.scale * 1.5,
                            alpha: 0,
                            duration: 200,
                            onComplete: () => confetti.destroy()
                        })
                    }
                })
            }, i * 60) // Slightly different timing than left side
        }
    }
}
