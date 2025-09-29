import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
    scoreText!: Phaser.GameObjects.Text
    timerText!: Phaser.GameObjects.Text

    constructor() { super('UI') }

    create() {
        const { width } = this.scale
        this.scoreText = this.add.text(24, 20, 'Score: 0', {
            font: '32px MuseoSansRounded', color: '#00559C'
        })
        this.timerText = this.add.text(width - 24, 20, '00.0s', {
            font: '32px MuseoSansRounded', color: '#00559C'
        }).setOrigin(1, 0)
    }

    setScore(n: number) { this.scoreText.setText(`Score: ${n}`) }
    setTimeLeft(sec: number) { this.timerText.setText(`${sec.toFixed(1)}s`) }

    setTimerColor(color: string) { this.timerText.setColor(color) }
    resetTimerColor() { this.timerText.setColor('#00559C') }

    getTimerPosition() {
        return { x: this.timerText.x, y: this.timerText.y }
    }
}
