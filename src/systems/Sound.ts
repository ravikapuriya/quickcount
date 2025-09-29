import { ASSET_KEYS } from '../data/gameConfigs';
import { Save } from './Save';

type SoundName = 'game_music_loop' | 'click' | 'toggle' | 'correct' | 'wrong';

let currentScene: Phaser.Scene | null = null;
let musicInstance: Phaser.Sound.BaseSound | null = null;

export const Sound = {
    init(scene: Phaser.Scene) {
        currentScene = scene;
    },

    enabled: async function (): Promise<boolean> {
        const save = await Save.get();
        return save.sfx !== false;
    },

    musicEnabled: async function (): Promise<boolean> {
        const save = await Save.get();
        return save.music !== false;
    },

    setEnabled: async function (on: boolean) {
        await Save.set({ sfx: on });
    },

    setMusicEnabled: async function (on: boolean) {
        await Save.set({ music: on });
        if (!on) {
            this.stopMusic();
        }
    },

    play: async function (name: SoundName) {
        if (!currentScene) {
            return;
        }

        // Check sfx/music settings, default to true if undefined
        const save = await Save.get();
        const sfxEnabled = save.sfx !== false;
        const musicEnabled = save.music !== false;

        if (!sfxEnabled && name !== 'game_music_loop') return;
        if (!musicEnabled && name === 'game_music_loop') return;

        switch (name) {
            case 'game_music_loop':
                await this.playMusic();
                break;
            case 'click':
            case 'toggle':
                currentScene.sound.play(ASSET_KEYS.SFX_BTN_CLICK);
                break;
            case 'correct':
                currentScene.sound.play(ASSET_KEYS.SFX_CORRECT_ANSWER);
                break;
            case 'wrong':
                currentScene.sound.play(ASSET_KEYS.SFX_WRONG_ANSWER);
                break;
        }
    },

    async playMusic() {
        if (!currentScene || !(await this.musicEnabled())) return;

        if (!musicInstance) {
            musicInstance = currentScene.sound.add(ASSET_KEYS.GAME_MUSIC_LOOP, {
                loop: true,
                volume: 0.3
            });
        }

        if (!musicInstance.isPlaying) {
            musicInstance.play();
        }
    },

    pauseMusic() {
        if (musicInstance && musicInstance.isPlaying) {
            musicInstance.pause();
        }
    },

    resumeMusic: async function () {
        if (musicInstance && !musicInstance.isPlaying && await this.musicEnabled()) {
            musicInstance.resume();
        }
    },

    stopMusic() {
        if (musicInstance) {
            musicInstance.stop();
        }
    },

    destroyMusic() {
        if (musicInstance) {
            musicInstance.destroy();
            musicInstance = null;
        }
    },

    setMusicVolume(volume: number) {
        if (musicInstance && 'setVolume' in musicInstance) {
            (musicInstance as any).setVolume(Math.max(0, Math.min(1, volume)));
        }
    },

    setSfxVolume(volume: number) {
        if (currentScene) {
            currentScene.sound.volume = Math.max(0, Math.min(1, volume));
        }
    }
};
