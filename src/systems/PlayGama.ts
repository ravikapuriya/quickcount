import { IS_BUILD } from '../data/gameConfigs';

declare global {
    interface Window {
        bridge: any;
    }
}

export interface PlayGamaPlayer {
    id: string | null;
    name: string;
    photo: string;
    isAuthorized: boolean;
    deviceType?: string;
    photos?: string[];
    extra?: any;
}

export interface PlayGamaLeaderboardEntry {
    rank: number;
    playerId: string;
    name: string;
    photo: string;
    score: number;
}

export class PlayGamaSDK {
    private static instance: PlayGamaSDK;
    private initialized: boolean = false;
    private bridge: any = null;
    private player: PlayGamaPlayer | null = null;
    private lastInterstitialTime: number = 0;

    private constructor() {
    }

    public static getInstance(): PlayGamaSDK {
        if (!PlayGamaSDK.instance) {
            PlayGamaSDK.instance = new PlayGamaSDK();
        }
        return PlayGamaSDK.instance;
    }

    public async initialize(): Promise<boolean> {
        if (this.initialized) {
            return true;
        }

        try {
            if (typeof window.bridge === 'undefined') {
                return false;
            }

            this.bridge = window.bridge;
            await this.bridge.initialize();
            this.initialized = true;
            await this.loadPlayer();
            return true;
        } catch (_error) {
            return false;
        }
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    public canShowInterstitial(minSeconds: number = 100): boolean {
        const now = Date.now();
        return now - this.lastInterstitialTime >= minSeconds * 1000;
    }

    private async loadPlayer(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            const isAuthorized = this.bridge.player.isAuthorized;

            this.player = {
                id: this.bridge.player.id,
                name: this.bridge.player.name || 'Player',
                photo: this.bridge.player.photos?.[0] || '',
                isAuthorized: isAuthorized || false,
                deviceType: this.bridge.device.type,
                photos: this.bridge.player.photos,
                extra: this.bridge.player.extra
            };
        } catch (_error) {
            // ignore player load errors
        }
    }

    public async showInterstitialAd(): Promise<boolean> {
        if (!this.initialized || !this.bridge) return false;

        try {
            await this.bridge.advertisement.showInterstitial();
            this.lastInterstitialTime = Date.now();
            return true;
        } catch (_error) {
            return false;
        }
    }

    public async showInterstitialAdWithSound(minSeconds: number = 100): Promise<boolean> {
        if (!this.isInitialized() || !this.bridge) return false;
        if (!this.canShowInterstitial(minSeconds)) return false;

        try { await import('./Sound').then(m => m.Sound.pauseMusic()).catch(() => { }) } catch { }

        try {
            return await this.showInterstitialAd();
        } finally {
            await import('./Sound').then(m => m.Sound.resumeMusic()).catch(() => { })
        }
    }

    public isRewardedAdSupported(): boolean {
        if (!this.initialized || !this.bridge) return false;
        return this.bridge.advertisement?.isRewardedSupported || false;
    }

    public getRewardedAdState(): string {
        if (!this.initialized || !this.bridge) return 'failed';
        return this.bridge.advertisement?.rewardedState || 'failed';
    }

    public onRewardedAdStateChange(callback: (state: string) => void): void {
        if (!this.initialized || !this.bridge) return;

        try {
            this.bridge.advertisement.on(
                this.bridge.EVENT_NAME.REWARDED_STATE_CHANGED,
                callback
            );
        } catch (error) {
            console.error('Failed to subscribe to rewarded ad state changes:', error);
        }
    }

    public async showRewardedAd(placement?: string): Promise<boolean> {
        if (!this.initialized || !this.bridge) return false;

        try {
            await this.bridge.advertisement.showRewarded(placement);
            return true;
        } catch (_error) {
            return false;
        }
    }

    public async saveData(key: string, value: any): Promise<boolean> {
        if (!IS_BUILD || !this.initialized || !this.bridge) {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }

        try {
            const storage = this.bridge.storage;
            if (storage && typeof storage.set === 'function') {
                const type = storage.isSupported?.('platform_internal') ? 'platform_internal' : 'local_storage';
                await storage.set(key, value, type);
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch {
                }
                return true;
            }

            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (_error) {
            localStorage.setItem(key, JSON.stringify(value));
            return false;
        }
    }

    public async loadData(key: string): Promise<any> {
        if (!IS_BUILD || !this.initialized || !this.bridge) {
            const localData = localStorage.getItem(key);
            return localData ? JSON.parse(localData) : null;
        }

        try {
            let cloudData: any = null;
            const storage = this.bridge.storage;
            if (storage && typeof storage.get === 'function') {
                const type = storage.isSupported?.('platform_internal') ? 'platform_internal' : 'local_storage';
                cloudData = await storage.get(key, type);
            }

            if (cloudData !== undefined && cloudData !== null) {
                try {
                    localStorage.setItem(key, JSON.stringify(cloudData));
                } catch {
                }
                return cloudData;
            }

            const localData = localStorage.getItem(key);
            return localData ? JSON.parse(localData) : null;
        } catch (_error) {
            const localData = localStorage.getItem(key);
            return localData ? JSON.parse(localData) : null;
        }
    }

    public async saveBulkData(data: Record<string, any>): Promise<boolean> {
        if (!IS_BUILD || !this.initialized || !this.bridge) {
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        }

        try {
            const storage = this.bridge.storage;
            if (storage && typeof storage.set === 'function') {
                const type = storage.isSupported?.('platform_internal') ? 'platform_internal' : 'local_storage';
                const keys = Object.keys(data);
                const values = Object.values(data);
                await storage.set(keys, values, type);
                for (const [key, value] of Object.entries(data)) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                    } catch {
                    }
                }
                return true;
            }

            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return true;
        } catch (_error) {
            for (const [key, value] of Object.entries(data)) {
                localStorage.setItem(key, JSON.stringify(value));
            }
            return false;
        }
    }

    public async loadBulkData(keys: string[]): Promise<Record<string, any>> {
        if (!IS_BUILD || !this.initialized || !this.bridge) {
            const result: Record<string, any> = {};
            for (const key of keys) {
                const localData = localStorage.getItem(key);
                if (localData) {
                    result[key] = JSON.parse(localData);
                }
            }
            return result;
        }

        try {
            const storage = this.bridge.storage;
            if (storage && typeof storage.get === 'function') {
                const type = storage.isSupported?.('platform_internal') ? 'platform_internal' : 'local_storage';
                const cloudData = await storage.get(keys, type);
                const result: Record<string, any> = {};

                if (Array.isArray(cloudData)) {
                    keys.forEach((key, index) => {
                        if (cloudData[index] !== undefined && cloudData[index] !== null) {
                            result[key] = cloudData[index];
                            try {
                                localStorage.setItem(key, JSON.stringify(cloudData[index]));
                            } catch {
                            }
                        } else {
                            const localData = localStorage.getItem(key);
                            if (localData) {
                                result[key] = JSON.parse(localData);
                            }
                        }
                    });
                }

                return result;
            }

            const result: Record<string, any> = {};
            for (const key of keys) {
                const localData = localStorage.getItem(key);
                if (localData) {
                    result[key] = JSON.parse(localData);
                }
            }
            return result;
        } catch (_error) {
            const result: Record<string, any> = {};
            for (const key of keys) {
                const localData = localStorage.getItem(key);
                if (localData) {
                    result[key] = JSON.parse(localData);
                }
            }
            return result;
        }
    }

    public async submitScore(score: number, leaderboardId: string = 'highscore'): Promise<boolean> {
        if (!this.initialized || !this.bridge) return false;

        try {
            await this.bridge.leaderboard.setScore(leaderboardId, score);
            return true;
        } catch (_error) {
            return false;
        }
    }

    public async getLeaderboard(leaderboardId: string = 'highscore', limit: number = 10): Promise<PlayGamaLeaderboardEntry[]> {
        if (!this.initialized || !this.bridge) return [];

        try {
            const entries = await this.bridge.leaderboard.getEntries(leaderboardId, {
                includeUser: true,
                quantityAround: Math.floor(limit / 2),
                quantityTop: limit
            });

            return entries.map((entry: any) => ({
                rank: entry.rank,
                playerId: entry.playerId,
                name: entry.name || 'Player',
                photo: entry.photo || '',
                score: entry.score
            }));
        } catch (_error) {
            return [];
        }
    }

    public async share(text: string = 'Check out my score in 2048 Drop!'): Promise<boolean> {
        if (!this.initialized || !this.bridge) return false;

        try {
            await this.bridge.social.share({
                text: text
            });
            return true;
        } catch (_error) {
            return false;
        }
    }

    public async inviteFriend(): Promise<boolean> {
        if (!this.initialized || !this.bridge) return false;

        try {
            await this.bridge.social.invite();
            return true;
        } catch (_error) {
            return false;
        }
    }

    public getPlayer(): PlayGamaPlayer | null {
        return this.player;
    }

    public getPlatformId(): string {
        if (!this.initialized || !this.bridge) return 'unknown';
        return this.bridge.platform.id;
    }

    public getPlatformLanguage(): string {
        if (!this.initialized || !this.bridge) return 'en';
        return this.bridge.platform.language;
    }

    public async gameReady(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            if (this.bridge.platform && typeof this.bridge.platform.sendMessage === 'function') {
                await this.bridge.platform.sendMessage('game_ready');
            } else if (this.bridge.game && typeof this.bridge.game.ready === 'function') {
                await this.bridge.game.ready();
            }
        } catch (_error) {
            // ignore
        }
    }

    public async happyTime(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            if (this.bridge.platform && typeof this.bridge.platform.sendMessage === 'function') {
                await this.bridge.platform.sendMessage('happy_time');
            } else if (this.bridge.game && typeof this.bridge.game.happyTime === 'function') {
                await this.bridge.game.happyTime();
            }
        } catch (_error) {
            // ignore
        }
    }

    public async gameplayStart(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            if (this.bridge.platform && typeof this.bridge.platform.sendMessage === 'function') {
                await this.bridge.platform.sendMessage('gameplay_started');
            } else if (this.bridge.game && typeof this.bridge.game.gameplayStart === 'function') {
                await this.bridge.game.gameplayStart();
            }
        } catch (_error) {
            // ignore
        }
    }

    public async gameplayStop(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            if (this.bridge.platform && typeof this.bridge.platform.sendMessage === 'function') {
                await this.bridge.platform.sendMessage('gameplay_stopped');
            } else if (this.bridge.game && typeof this.bridge.game.gameplayStop === 'function') {
                await this.bridge.game.gameplayStop();
            }
        } catch (_error) {
            // ignore
        }
    }

    public async playerGotAchievement(): Promise<void> {
        if (!this.initialized || !this.bridge) return;

        try {
            if (this.bridge.platform && typeof this.bridge.platform.sendMessage === 'function') {
                await this.bridge.platform.sendMessage('player_got_achievement');
            }
        } catch (_error) {
            // ignore
        }
    }
}
