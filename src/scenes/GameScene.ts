import Phaser from 'phaser'
import { DifficultyManager } from '../systems/DifficultyManager'
import { PowerupManager } from '../systems/PowerupManager'
import { makeQuestion } from '../systems/QuestionGenerator'
import { dailyRNG } from '../systems/Daily'
import type { Question } from '../data/types'
import { Save } from '../systems/Save'
import { Sound } from '../systems/Sound'
import type { RNG } from '../systems/RNG'
import { ASSET_KEYS, SCENE_KEYS } from '../data/gameConfigs'

export class GameScene extends Phaser.Scene {
    private diff!: DifficultyManager
    private power!: PowerupManager
    private score = 0
    private streak = 0
    private timeLeft = 60
    private currentQ!: Question
    private choiceTexts: Phaser.GameObjects.Text[] = []
    private choiceZones: Phaser.GameObjects.Image[] = []
    private timerEvent!: Phaser.Time.TimerEvent
    private mode: 'classic' | 'daily' = 'classic'
    private rng: RNG | null = null

    constructor() { super(SCENE_KEYS.GAME) }

    init(data: { mode?: 'classic' | 'daily' }) { this.mode = data.mode ?? 'classic' }

    async create() {
        const save = await Save.get();
        Sound.init(this);
        Sound.playMusic();

        const gameBg = this.add.image(this.scale.width / 2, this.scale.height / 2, ASSET_KEYS.GAME_BG);
        gameBg.setDisplaySize(this.scale.width, this.scale.height);

        this.scene.run(SCENE_KEYS.UI);
        this.events.on('shutdown', () => this.scene.stop(SCENE_KEYS.UI))

        this.diff = new DifficultyManager()
        this.power = new PowerupManager()

        this.score = 0
        this.streak = 0
        this.timeLeft = 60
        this.rng = this.mode === 'daily' ? dailyRNG() : null

        this.timerEvent = this.time.addEvent({
            delay: 100, loop: true, callback: () => {
                if (!this.power.isFrozen) {
                    const slow = this.power.isSlowActive(this.time.now) ? 0.5 : 1
                    this.timeLeft -= 0.1 * slow
                }
                this.game.events.emit('ui:setTime', this.timeLeft)
                if (this.timeLeft <= 0) this.endGame()
            }
        });

        this.game.events.on('ui:setTime', (t: number) => {
            const ui = this.scene.get(SCENE_KEYS.UI) as any
            ui.setTimeLeft?.(Math.max(0, t))
        })
        this.game.events.on('ui:setScore', (s: number) => {
            const ui = this.scene.get(SCENE_KEYS.UI) as any
            ui.setScore?.(s)
        })

        this.layout()
        this.nextQuestion()
    }

    layout() {
        const { width } = this.scale
        const modeText = this.mode === 'daily' ? 'Daily' : 'Classic'
        this.add.text(width / 2, 96, `${modeText} — Solve:`, {
            font: '30px MuseoSansRounded', color: '#F76F12'
        }).setOrigin(0.5)
        this.add.image(width / 2, 200, 'chip').setDepth(-1).setAlpha(0.6)
    }

    nextQuestion() {
        this.choiceTexts.forEach(t => t.destroy())
        this.choiceZones.forEach(z => z.destroy())
        this.choiceTexts = []
        this.choiceZones = []

        const rules = this.diff.getRules()
        this.currentQ = makeQuestion(rules, this.rng)

        const { width } = this.scale
        this.add.text(width / 2, 200, this.currentQ.text, {
            font: '52px MuseoSansRounded', color: '#e6edf3'
        }).setOrigin(0.5)

        const startY = 380
        const gap = 170

        this.currentQ.choices.forEach((choice, idx) => {
            const y = startY + idx * gap
            const chip = this.add.image(width / 2, y, 'chip').setInteractive({ useHandCursor: true })
            const txt = this.add.text(width / 2, y, String(choice), {
                font: '48px MuseoSansRounded', color: '#fff'
            }).setOrigin(0.5)
            chip.on('pointerdown', () => this.answer(choice, chip, txt))
            this.choiceZones.push(chip)
            this.choiceTexts.push(txt)
        })

        this.drawPowerups()
    }

    drawPowerups() {
        const { width, height } = this.scale
        const barY = height - 140
        const keys: Array<['freeze' | 'fifty' | 'slow', string]> = [
            ['freeze', 'Freeze'],
            ['fifty', '50/50'],
            ['slow', 'Slow']
        ]
        keys.forEach((k, i) => {
            const x = width / 2 + (i - 1) * 220
            const btn = this.add.image(x, barY, 'btn-outline').setInteractive({ useHandCursor: true })
            const uses = (k[0] === 'freeze' ? this.power.freeze : k[0] === 'fifty' ? this.power.fifty : this.power.slow)
            this.add.text(x, barY, `${k[1]} (${uses})`, {
                font: '28px MuseoSansRounded', color: '#177CBF'
            }).setOrigin(0.5)
            btn.on('pointerdown', () => {
                if (k[0] === 'freeze') {
                    if (this.power.useFreeze(this.time.now)) {
                        Sound.play('correct');
                        this.time.delayedCall(3000, () => this.power.unfreeze())
                    } else { Sound.play('wrong') }
                } else if (k[0] === 'fifty') {
                    if (this.power.useFifty()) { Sound.play('click'); this.applyFiftyFifty() } else { Sound.play('wrong') }
                } else {
                    if (this.power.useSlow(this.time.now)) { Sound.play('click') } else { Sound.play('wrong') }
                }
            })
        })
    }

    applyFiftyFifty() {
        const wrong = this.currentQ.choices.filter(c => c !== this.currentQ.answer)
        const remove = wrong.slice(0, 2) // deterministic enough for now
        for (let i = 0; i < this.choiceTexts.length; i++) {
            const t = this.choiceTexts[i]
            const val = Number(t.text)
            if (remove.includes(val)) {
                t.setAlpha(0.3)
                this.choiceZones[i].disableInteractive()
                this.choiceZones[i].setAlpha(0.3)
            }
        }
    }

    answer(choice: number, chip: Phaser.GameObjects.Image, txt: Phaser.GameObjects.Text) {
        const correct = choice === this.currentQ.answer
        const { width, height } = this.scale

        // Disable all choice interactions immediately
        this.choiceZones.forEach(zone => zone.disableInteractive())

        if (correct) {
            Sound.play('correct')
            const scoreIncrease = 10 + Math.max(0, this.streak - 2)
            this.score += scoreIncrease
            this.streak += 1

            // Add 3 seconds to timer
            this.timeLeft += 3

            // Visual feedback for correct answer - green tint
            chip.setTint(0x00ff00)
            txt.setColor('#00ff00')

            // Score increase animation
            const scoreText = this.add.text(width / 2, 300, `+${scoreIncrease}`, {
                font: '48px MuseoSansRounded',
                color: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0)

            this.tweens.add({
                targets: scoreText,
                alpha: 1,
                y: scoreText.y - 80,
                duration: 800,
                ease: 'Power2',
                onComplete: () => scoreText.destroy()
            })

            // Change timer color to green and get timer position
            const ui = this.scene.get(SCENE_KEYS.UI) as any
            ui.setTimerColor?.('#00ff00')

            // +3 seconds time bonus animation near timer
            const timerPos = ui.getTimerPosition?.() || { x: width - 24, y: 20 }
            const timeBonus = this.add.text(timerPos.x - 60, timerPos.y + 40, '+3s', {
                font: '28px MuseoSansRounded',
                color: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0)

            this.tweens.add({
                targets: timeBonus,
                alpha: 1,
                y: timeBonus.y - 40,
                duration: 1000,
                ease: 'Bounce.easeOut',
                onComplete: () => {
                    timeBonus.destroy()
                    ui.resetTimerColor?.()
                }
            })

            // Choice scale animation
            this.tweens.add({
                targets: [chip, txt],
                scale: 1.1,
                duration: 300,
                yoyo: true,
                ease: 'Power2'
            })

        } else {
            Sound.play('wrong')
            this.streak = 0

            // Subtract 2 seconds from timer
            this.timeLeft = Math.max(0, this.timeLeft - 2)

            // Visual feedback for wrong answer - red tint
            chip.setTint(0xff0000)
            txt.setColor('#ff0000')

            // Change timer color to red and get timer position
            const ui = this.scene.get(SCENE_KEYS.UI) as any
            ui.setTimerColor?.('#ff0000')

            // -2 seconds time penalty animation near timer
            const timerPos = ui.getTimerPosition?.() || { x: width - 24, y: 20 }
            const timePenalty = this.add.text(timerPos.x - 60, timerPos.y + 40, '-2s', {
                font: '28px MuseoSansRounded',
                color: '#ff0000',
                fontStyle: 'bold'
            }).setOrigin(0.5).setAlpha(0)

            this.tweens.add({
                targets: timePenalty,
                alpha: 1,
                y: timePenalty.y - 40,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    timePenalty.destroy()
                    ui.resetTimerColor?.()
                }
            })

            // Choice shake animation
            this.tweens.add({
                targets: [chip, txt],
                x: chip.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3
            })
        }

        this.game.events.emit('ui:setScore', this.score)
        this.diff.report(correct)

        // Show next question after feedback duration
        this.time.delayedCall(1200, () => {
            this.children.removeAll(true)
            this.layout()
            this.nextQuestion()
        })
    }

    endGame() { this.scene.stop(SCENE_KEYS.UI); this.scene.start(SCENE_KEYS.GAMEOVER, { score: this.score, mode: this.mode }) }
}
