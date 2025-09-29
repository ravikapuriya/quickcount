import Phaser from 'phaser'
import { Sound } from '../systems/Sound'
import { dailyInfo } from '../systems/Daily'
import { Save } from '../systems/Save'
import { ASSET_KEYS, SCENE_KEYS } from '../data/gameConfigs'

export class MenuScene extends Phaser.Scene {
    constructor() { super('Menu') }

    async create() {
        const { width, height } = this.scale;

        const gameBg = this.add.image(width / 2, height / 2, ASSET_KEYS.GAME_BG);
        gameBg.setDisplaySize(width, height);

        this.add.text(width / 2, 160, 'Quick Count', {
            font: '64px MuseoSansRounded', color: '#3a3a3a', fontStyle: 'bold'
        }).setOrigin(0.5)
        const di = dailyInfo()

        const classic = this.add.image(width / 2, height / 2 - 60, 'btn').setInteractive({ useHandCursor: true })
        this.add.text(classic.x, classic.y, 'Play Game', {
            font: '34px MuseoSansRounded', color: '#fff', align: 'center'
        }).setOrigin(0.5);
        classic.on('pointerdown', () => {
            Sound.play('click');
            this.scene.start(SCENE_KEYS.GAME, { mode: 'classic' });
        });

        const daily = this.add.image(width / 2, height / 2 + 60, 'btn').setInteractive({ useHandCursor: true })
        this.add.text(daily.x, daily.y, `Daily Challenge\n(${di.dd}/${di.MM}/${di.yyyy})`, {
            font: '34px MuseoSansRounded', color: '#fff', align: 'center'
        }).setOrigin(0.5);
        daily.on('pointerdown', () => {
            Sound.play('click');
            this.scene.start(SCENE_KEYS.GAME, { mode: 'daily' });
        });

        const save = await Save.get()
        const bestScore = save.bestScores.classic60 || 0;
        this.add.text(width / 2, height - 90, `Classic Best Score: ${bestScore}`, {
            font: '24px MuseoSansRounded', color: '#3a3a3a'
        }).setOrigin(0.5);

        const bestScoreDaily = save.bestScores[`daily_${di.dd}/${di.MM}/${di.yyyy}`] || 0;
        this.add.text(width / 2, height - 50, `Today's (${di.dd}/${di.MM}/${di.yyyy}) Best Score: ${bestScoreDaily}`, {
            font: '24px MuseoSansRounded', color: '#3a3a3a'
        }).setOrigin(0.5);
    }
}
