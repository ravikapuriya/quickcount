import { IS_BUILD, IS_PLAYGAMA } from '../data/gameConfigs';
import { PlayGamaSDK } from './PlayGama';

export interface SaveData {
    coins: number;
    xp: number;
    bestScores: Record<string, number>;
    sfx: boolean;
    music: boolean;
    lang: string;
    powerups: {
        freeze: number;
        fifty: number;
        slow: number;
    };
}

const DEFAULT_SAVE: SaveData = {
    coins: 0,
    xp: 0,
    bestScores: {},
    sfx: true,
    music: true,
    lang: 'en',
    powerups: {
        freeze: 3,
        fifty: 3,
        slow: 3
    }
}

const SAVE_KEYS: (keyof SaveData)[] = [
    'coins',
    'xp',
    'bestScores',
    'sfx',
    'music',
    'lang',
    'powerups'
];

const addKeyPrefix = (key: string): string => `rk.quickcount.${key}`;
const removeKeyPrefix = (key: string): string => key.replace('rk.quickcount.', '');

let cache: SaveData | null = null;
let pendingSave: Promise<SaveData> | null = null;

export const Save = {
    get: async function (): Promise<SaveData> {
        if (pendingSave) {
            return pendingSave;
        }

        if (cache) {
            return cache;
        }

        pendingSave = this.loadSave();
        try {
            const result = await pendingSave;
            cache = result;
            return result;
        } finally {
            pendingSave = null;
        }
    },

    async loadSave(): Promise<SaveData> {
        const sdk = PlayGamaSDK.getInstance();
        let loadedData: Partial<SaveData> = {};

        if (sdk.isInitialized() && IS_BUILD && IS_PLAYGAMA) {
            try {
                const prefixedKeys = SAVE_KEYS.map(addKeyPrefix);
                const bulkData = await sdk.loadBulkData(prefixedKeys);

                for (const [prefixedKey, value] of Object.entries(bulkData)) {
                    const originalKey = removeKeyPrefix(prefixedKey) as keyof SaveData;
                    loadedData[originalKey] = value;
                }
            } catch (_error) {
                loadedData = await this.loadFromLocalStorage();
            }
        } else {
            loadedData = await this.loadFromLocalStorage();
        }

        return { ...DEFAULT_SAVE, ...loadedData };
    },

    async loadFromLocalStorage(): Promise<Partial<SaveData>> {
        const data = localStorage.getItem('rk.quickcount.save');
        return data ? JSON.parse(data) : {};
    },

    set: async function (data: Partial<SaveData>): Promise<void> {
        const sdk = PlayGamaSDK.getInstance();
        const current = await this.get();
        const newData = { ...current, ...data };

        cache = newData;

        if (sdk.isInitialized() && IS_BUILD && IS_PLAYGAMA) {
            try {
                const prefixedData: Record<string, any> = {};
                for (const [key, value] of Object.entries(data)) {
                    prefixedData[addKeyPrefix(key)] = value;
                }
                await sdk.saveBulkData(prefixedData);
            } catch (_error) {
                this.saveToLocalStorage(newData);
            }
        } else {
            this.saveToLocalStorage(newData);
        }
    },

    saveToLocalStorage(data: SaveData): void {
        localStorage.setItem('rk.quickcount.save', JSON.stringify(data));
    },

    clearCache: function (): void {
        cache = null;
    }
};
