import Phaser from 'phaser'
import { Sound } from '../systems/Sound'
import { ATLAS_ASSETS, AUDIO_ASSETS, GameOptions, IMAGE_ASSETS, IS_BUILD, IS_PLAYGAMA, JSON_ASSETS, SCENE_KEYS } from '../data/gameConfigs';
import { PlayGamaSDK } from '../systems/PlayGama';

export class PreloadScene extends Phaser.Scene {
    constructor() { super(SCENE_KEYS.PRELOAD) }

    init(): void {
        const barX: number = (this.game.config.width as number - GameOptions.preloadBar.size.width) / 2;
        const barY: number = (this.game.config.height as number - GameOptions.preloadBar.size.height) / 2;

        this.add.rectangle(barX, barY, GameOptions.preloadBar.size.width + 4, GameOptions.preloadBar.size.height + 4, GameOptions.preloadBar.color.container).setStrokeStyle(GameOptions.preloadBar.size.border, GameOptions.preloadBar.color.border).setOrigin(0);

        const bar: Phaser.GameObjects.Rectangle = this.add.rectangle(barX + 2, barY + 2, 1, GameOptions.preloadBar.size.height, GameOptions.preloadBar.color.fill);
        bar.setOrigin(0);

        const loadingText = this.add.text(this.game.config.width as number / 2, barY - 30, 'Loading...', {
            font: '24px MuseoSansRounded',
            color: '#003673'
        }).setOrigin(0.5);
        loadingText.setDepth(1);

        this.load.on('progress', (progress: number) => {
            bar.width = GameOptions.preloadBar.size.width * progress;
        });

        this.load.on('complete', () => {
            bar.destroy();
            loadingText.destroy();
        });
    }

    preload() {
        const allAssetUrls = import.meta.glob('/assets/**/*', {
            eager: true,
            query: '?url',
            import: 'default'
        }) as Record<string, string>;
        const toUrl = (path: string) => {
            const normalized = path.startsWith('/') ? path : `/${path}`;
            return allAssetUrls[normalized] ?? normalized;
        };

        for (const a of ATLAS_ASSETS) {
            this.load.atlas(a.assetKey, toUrl(a.path), toUrl(a.jsonPath));
        }

        for (const i of IMAGE_ASSETS) {
            this.load.image(i.assetKey, toUrl(i.path));
        }

        for (const au of AUDIO_ASSETS) {
            this.load.audio(au.assetKey, toUrl(au.path));
        }

        const g = this.add.graphics()
        const btns = [
            { key: 'btn', fill: 0x1f6feb, stroke: 0x58a6ff },
        ]
        for (const b of btns) {
            g.clear()
            g.fillStyle(b.fill).fillRoundedRect(0, 0, 400, 100, 18)
            g.lineStyle(6, b.stroke).strokeRoundedRect(0, 0, 400, 100, 18)
            this.textures.remove(b.key)
            g.generateTexture(b.key, 400, 100)
        }
        g.clear(); g.lineStyle(6, 0x58a6ff).strokeRoundedRect(0, 0, 400, 100, 18)
        this.textures.remove('btn-outline'); g.generateTexture('btn-outline', 400, 100)

        g.clear(); g.fillStyle(0x30363d).fillRoundedRect(0, 0, 600, 160, 22)
        this.textures.remove('chip'); g.generateTexture('chip', 600, 160)
        g.destroy()
    }


    async create() {
        Sound.init(this);

        // Initialize PlayGama SDK
        if (IS_BUILD && IS_PLAYGAMA) {
            const playGama = PlayGamaSDK.getInstance();
            const isInitialized = await playGama.initialize();
            if (isInitialized) {
                await playGama.gameReady();
            }
        }

        this.scene.start(SCENE_KEYS.MENU);
    }
}
