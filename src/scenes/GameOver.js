import { gameDataManager } from './DataManager.js';

export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x8b0000);

        this.add.image(512, 384, 'background').setAlpha(0.4);

        // Game Over title
        this.add.text(512, 150, 'GAME OVER', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 12,
            align: 'center'
        }).setOrigin(0.5);

        // Score display
        this.add.text(512, 250, `Final Score: ${this.finalScore}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Best score display
        const bestScore = gameDataManager.getBestScore();
        const isNewRecord = this.finalScore >= bestScore;
        
        if (isNewRecord && this.finalScore > 0) {
            this.add.text(512, 300, 'NEW RECORD!', {
                fontFamily: 'Arial Black', fontSize: 28, color: '#00ff00',
                stroke: '#000000', strokeThickness: 6,
                align: 'center'
            }).setOrigin(0.5);
        } else {
            this.add.text(512, 300, `Best Score: ${bestScore}`, {
                fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
                stroke: '#000000', strokeThickness: 5,
                align: 'center'
            }).setOrigin(0.5);
        }

        // Money earned display
        this.add.text(512, 350, `Money Earned: $${this.finalScore}`, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#00ff00',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Current stats
        this.add.text(512, 400, 
            `Total Money: $${gameDataManager.getDollars()}\n` +
            `Total Hits: ${gameDataManager.getTotalHits()}\n` +
            `Balls Unlocked: ${gameDataManager.getUnlockedBalls().length}/14`, {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Play Again button
        this.playAgainButton = this.add.rectangle(412, 520, 180, 60, 0x27ae60);
        this.playAgainButton.setStrokeStyle(4, 0x229954);
        this.playAgainButton.setInteractive();
        this.playAgainButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        this.playAgainButton.on('pointerover', () => {
            this.playAgainButton.setFillStyle(0x2ecc71);
            this.playAgainButton.setScale(1.05);
        });
        this.playAgainButton.on('pointerout', () => {
            this.playAgainButton.setFillStyle(0x27ae60);
            this.playAgainButton.setScale(1);
        });

        this.add.text(412, 520, 'PLAY AGAIN', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Main Menu button
        this.menuButton = this.add.rectangle(612, 520, 180, 60, 0x3498db);
        this.menuButton.setStrokeStyle(4, 0x2980b9);
        this.menuButton.setInteractive();
        this.menuButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
        this.menuButton.on('pointerover', () => {
            this.menuButton.setFillStyle(0x5dade2);
            this.menuButton.setScale(1.05);
        });
        this.menuButton.on('pointerout', () => {
            this.menuButton.setFillStyle(0x3498db);
            this.menuButton.setScale(1);
        });

        this.add.text(612, 520, 'MAIN MENU', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Shop button
        this.shopButton = this.add.rectangle(512, 600, 180, 60, 0xe67e22);
        this.shopButton.setStrokeStyle(4, 0xd35400);
        this.shopButton.setInteractive();
        this.shopButton.on('pointerdown', () => {
            this.scene.start('Shop');
        });
        this.shopButton.on('pointerover', () => {
            this.shopButton.setFillStyle(0xf39c12);
            this.shopButton.setScale(1.05);
        });
        this.shopButton.on('pointerout', () => {
            this.shopButton.setFillStyle(0xe67e22);
            this.shopButton.setScale(1);
        });

        this.add.text(512, 600, 'SHOP', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Add some visual effects
        this.createGameOverEffects();
    }

    createGameOverEffects() {
        // Create some falling particles
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(
                Phaser.Math.Between(0, 1024),
                Phaser.Math.Between(-100, 0),
                Phaser.Math.Between(3, 8),
                0xff0000,
                0.6
            );
            
            this.tweens.add({
                targets: particle,
                y: 800,
                duration: Phaser.Math.Between(2000, 5000),
                ease: 'Linear',
                onComplete: () => particle.destroy()
            });
        }
    }
}
