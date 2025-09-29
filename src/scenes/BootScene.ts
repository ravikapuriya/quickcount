import Phaser from 'phaser'
import { SCENE_KEYS } from '../data/gameConfigs'

export class BootScene extends Phaser.Scene {
    constructor() { super(SCENE_KEYS.BOOT) }
    create() {
        this.scale.scaleMode = Phaser.Scale.FIT
        this.scale.refresh()
        this.scene.start(SCENE_KEYS.PRELOAD)
    }
}
