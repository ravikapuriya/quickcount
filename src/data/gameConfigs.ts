export const IS_BUILD = import.meta.env.MODE === 'production'; // Set to false for local testing without PlayGama

// set to true when building for PlayGama platform
export const IS_PLAYGAMA = true;

export const GameOptions = {
    preloadBar: {
        size: {
            width: 200,
            height: 20,
            border: 3,
        },
        color: {
            fill: 0xE71B64,
            container: 0xFEC23B,
            border: 0xF9F9F9
        },
    },

    gameWidth: 720,
    gameHeight: 1280,
};


export const SCENE_KEYS = Object.freeze({
    BOOT: 'Boot',
    PRELOAD: 'Preload',
    MENU: 'Menu',
    GAME: 'Game',
    UI: 'UI',
    GAMEOVER: 'GameOver',
});

export const EVENT_KEYS = Object.freeze({
    GAME_START: 'gameStart',
    SCORE: 'score',
    GAME_OVER: 'gameOver',
    POWERUP_USED: 'powerupUsed',
    GAME_PAUSED: 'gamePaused',
    GAME_RESUMED: 'gameResumed',
});

export const ASSET_KEYS = Object.freeze({
    // UI
    GAME_BG: 'GAME_BG',
    LOGO: 'LOGO',

    // ATLAS
    GAME_UI: 'GAME_UI',
    CONFETTI: 'CONFETTI',

    // AUDIO
    GAME_MUSIC_LOOP: 'GAME_MUSIC_LOOP',
    SFX_BTN_CLICK: 'SFX_BTN_CLICK',
    SFX_CORRECT_ANSWER: 'SFX_CORRECT_ANSWER',
    SFX_WRONG_ANSWER: 'SFX_WRONG_ANSWER',
    SFX_TIME_WARNING: 'SFX_TIME_WARNING',

});

export const ATLAS_ASSETS = [
    {
        assetKey: ASSET_KEYS.GAME_UI,
        path: 'assets/atlas/game-ui.png',
        jsonPath: 'assets/atlas/game-ui.json'
    },
    {
        assetKey: ASSET_KEYS.CONFETTI,
        path: 'assets/atlas/confetti.png',
        jsonPath: 'assets/atlas/confetti.json'
    },
];

export const IMAGE_ASSETS = [
    {
        assetKey: ASSET_KEYS.GAME_BG,
        path: 'assets/images/blue_bg.png'
    },
];

export const AUDIO_ASSETS = [
    {
        assetKey: ASSET_KEYS.GAME_MUSIC_LOOP,
        path: 'assets/sounds/game-music-loop.mp3',
        loop: true,
        volume: 0.3,
    },
    {
        assetKey: ASSET_KEYS.SFX_BTN_CLICK,
        path: 'assets/sounds/click-sfx.mp3',
        loop: false,
        volume: 0.8,
    },
    {
        assetKey: ASSET_KEYS.SFX_CORRECT_ANSWER,
        path: 'assets/sounds/correct-sfx.mp3',
        loop: false,
        volume: 0.8,
    },
    {
        assetKey: ASSET_KEYS.SFX_WRONG_ANSWER,
        path: 'assets/sounds/wrong-sfx.mp3',
        loop: false,
        volume: 0.8,
    }
];

export const JSON_ASSETS = [
    // {
    //     type: 'json',
    //     assetKey: ASSET_KEYS.LANG_EN_TEXT,
    //     path: 'assets/lang-data/en.json'
    // },
];
