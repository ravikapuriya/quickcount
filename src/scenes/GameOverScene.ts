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

        // Simple top-to-bottom falling confetti
        const confettiFrames = [
            'confetti_red.png',
            'confetti_blue.png',
            'confetti_yellow.png',
            'confetti_green.png',
            'confetti_pink.png',
            'confetti_purple.png',
            'confetti_white.png'
        ]

        // Create falling confetti pieces
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                // Random starting position across the top of screen
                const startX = Math.random() * width
                const startY = -50 - Math.random() * 200 // Start above screen

                // Random confetti frame
                const randomFrame = confettiFrames[Math.floor(Math.random() * confettiFrames.length)]
                const confetti = this.add.sprite(startX, startY, ASSET_KEYS.CONFETTI, randomFrame)

                // Random scale and rotation
                const scale = 0.3 + Math.random() * 0.4
                confetti.setScale(scale)
                confetti.setRotation(Math.random() * Math.PI * 2)

                // Fall down with gentle side-to-side sway
                this.tweens.add({
                    targets: confetti,
                    y: height + 100,
                    x: startX + (Math.random() - 0.5) * 100, // Gentle horizontal drift
                    rotation: confetti.rotation + Math.PI * 4,
                    duration: 3000 + Math.random() * 2000, // 3-5 seconds fall time
                    ease: 'Linear',
                    onComplete: () => confetti.destroy()
                })

                // Additional gentle swaying motion
                this.tweens.add({
                    targets: confetti,
                    x: startX + Math.sin(i * 0.5) * 30,
                    duration: 1000 + Math.random() * 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                })
            }, i * 100) // Stagger the confetti pieces
        }
    }
}
