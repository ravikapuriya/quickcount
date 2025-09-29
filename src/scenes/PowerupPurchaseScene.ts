import Phaser from 'phaser'
import { Save } from '../systems/Save'
import { ASSET_KEYS, IS_BUILD, IS_PLAYGAMA, SCENE_KEYS } from '../data/gameConfigs'
import { PlayGamaSDK } from '../systems/PlayGama'

export class PowerupPurchaseScene extends Phaser.Scene {
    private powerupType!: 'freeze' | 'fifty' | 'slow'
    private powerupNames = {
        freeze: 'Freeze',
        fifty: '50/50',
        slow: 'Slow Motion'
    }
    private powerupDescriptions = {
        freeze: 'Freezes the timer for 3 seconds',
        fifty: 'Removes 2 wrong answers',
        slow: 'Slows down timer for 5 seconds'
    }
    constructor() { super('PowerupPurchase') }

    init(data: { powerupType: 'freeze' | 'fifty' | 'slow' }) {
        this.powerupType = data.powerupType
    }

    async create() {
        const { width, height } = this.scale
        const save = await Save.get();

        const popupWidth = 400;
        const popupHeight = 420;

        // Semi-transparent overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
        overlay.setInteractive()

        // Create popup container
        const popupContainer = this.add.container(width / 2, height / 2);

        // Main popup background using game-ui atlas
        const popup = this.add.image(0, 0, ASSET_KEYS.GAME_UI, 'popup');
        popup.setOrigin(0.5).setDisplaySize(popupWidth, popupHeight);
        popupContainer.add(popup);
        popupContainer.setDepth(1);
        // Close button
        const closeBtn = this.add.image(0, popupHeight / 2 - 10, ASSET_KEYS.GAME_UI, 'close_btn')
        closeBtn.setInteractive({ useHandCursor: true })
        closeBtn.on('pointerdown', () => this.closePopup())

        // Powerup title
        const title = this.powerupNames[this.powerupType]
        const titleText = this.add.text(10, -176, title, {
            font: '42px MuseoSansRounded',
            color: '#2c3e50',
            fontStyle: 'bold'
        }).setOrigin(0.5)

        // Coins display with background - clickable for rewarded ads
        const coinsBg = this.add.image(0, -70, ASSET_KEYS.GAME_UI, 'coins_bg');
        coinsBg.setInteractive({ useHandCursor: true }).setOrigin(0.5)

        const coinsText = this.add.text(-10, -70, `${save.coins}`, {
            font: '24px MuseoSansRounded',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5)

        // Add rewarded ad functionality
        coinsBg.on('pointerdown', async () => {
            if (IS_BUILD && IS_PLAYGAMA) {
                const playGama = PlayGamaSDK.getInstance()
                if (playGama.isInitialized()) {
                    const adSuccess = await playGama.showRewardedAd()

                    if (adSuccess) {
                        // On successful ad completion, give 50 coins
                        const currentSave = await Save.get()
                        await Save.set({
                            coins: currentSave.coins + 50
                        })

                        // Update the display
                        const newSave = await Save.get()
                        coinsText.setText(`${newSave.coins}`)

                        // Show reward feedback
                        const rewardText = this.add.text(0, -40, '+50 coins!', {
                            font: '20px MuseoSansRounded',
                            color: '#00ff00',
                            fontStyle: 'bold'
                        }).setOrigin(0.5)

                        popupContainer.add(rewardText)

                        this.tweens.add({
                            targets: rewardText,
                            alpha: 0,
                            y: rewardText.y - 40,
                            duration: 2000,
                            onComplete: () => {
                                popupContainer.remove(rewardText)
                                rewardText.destroy()
                            }
                        })
                    } else {
                        // Show error feedback
                        const errorText = this.add.text(0, -40, 'Ad not available', {
                            font: '18px MuseoSansRounded',
                            color: '#ff6b6b',
                            fontStyle: 'bold'
                        }).setOrigin(0.5)

                        popupContainer.add(errorText)

                        this.tweens.add({
                            targets: errorText,
                            alpha: 0,
                            duration: 2000,
                            onComplete: () => {
                                popupContainer.remove(errorText)
                                errorText.destroy()
                            }
                        })
                    }
                }
            } else {
                // For development/testing - simulate rewarded ad
                const currentSave = await Save.get()
                await Save.set({
                    coins: currentSave.coins + 50
                })

                const newSave = await Save.get()
                coinsText.setText(`${newSave.coins}`)

                const rewardText = this.add.text(0, -40, '+50 coins! (test)', {
                    font: '20px MuseoSansRounded',
                    color: '#00ff00',
                    fontStyle: 'bold'
                }).setOrigin(0.5)

                popupContainer.add(rewardText)

                this.tweens.add({
                    targets: rewardText,
                    alpha: 0,
                    y: rewardText.y - 40,
                    duration: 2000,
                    onComplete: () => {
                        popupContainer.remove(rewardText)
                        rewardText.destroy()
                    }
                })
            }
        })

        // Powerup description
        const powerupDescription = this.add.text(popupContainer.width / 2, 0, this.powerupDescriptions[this.powerupType], {
            font: '22px MuseoSansRounded',
            color: '#34495e',
            align: 'center',
            wordWrap: { width: 300, useAdvancedWrap: true }
        }).setOrigin(0.5)

        // Price section
        const priceY = popupContainer.height / 2 + 80

        // Price background
        const priceBg = this.add.image(0, priceY, ASSET_KEYS.GAME_UI, 'price-bg-btn')
        priceBg.setScale(2, 1.5)
        priceBg.setInteractive({ useHandCursor: true })

        const priceText = this.add.text(10, priceY, '100 coins', {
            font: '18px MuseoSansRounded',
            color: '#fff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5)

        // Purchase interaction
        priceBg.on('pointerdown', async () => {
            // Get current save data to check updated coin count
            const currentSave = await Save.get()

            if (currentSave.coins >= 100) {
                // Deduct coins and add powerups
                await Save.set({
                    coins: currentSave.coins - 100,
                    powerups: {
                        ...currentSave.powerups,
                        [this.powerupType]: currentSave.powerups[this.powerupType] + 3
                    }
                })

                this.closePopup()

                // Emit event to refresh the game scene powerups display
                this.game.events.emit('powerup:purchased', this.powerupType)
            } else {
                // Show insufficient funds feedback
                const errorText = this.add.text(10, priceY + 40, 'Not enough coins!', {
                    font: '20px MuseoSansRounded',
                    color: '#e74c3c',
                    fontStyle: 'bold'
                }).setOrigin(0.5)

                popupContainer.add(errorText)

                // Fade out error message
                this.tweens.add({
                    targets: errorText,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => {
                        popupContainer.remove(errorText)
                        errorText.destroy()
                    }
                })
            }
        })

        popupContainer.add([titleText, coinsBg, coinsText, powerupDescription, priceBg, priceText, closeBtn])

        // Scale animation for popup appearance
        popupContainer.setScale(0)
        this.tweens.add({
            targets: popupContainer,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut',
        })
    }

    closePopup() {
        this.scene.stop();
        this.scene.resume(SCENE_KEYS.GAME);
    }
}
