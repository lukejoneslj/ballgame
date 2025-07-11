import { gameDataManager } from './DataManager.js';
import { firebaseService } from '../services/FirebaseService.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        this.allTimeHighScore = null;
    }

    create() {
        // Check if username is set, if not redirect to username input
        if (!gameDataManager.getCurrentUsername()) {
            this.scene.start('UsernameInput');
            return;
        }

        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.add.image(1024, 768, 'background').setAlpha(0.2);

        // Main title - more prominent
        this.add.text(1024, 160, 'I LOVE BALLS', {
            fontFamily: 'Arial Black', fontSize: 136, color: '#ffffff',
            stroke: '#000000', strokeThickness: 24,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle - better styling
        this.add.text(1024, 280, 'ULTIMATE EDITION', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#00d4ff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // All-time high score display
        this.createAllTimeHighScoreDisplay();

        // Welcome message with username
        this.add.text(1024, 400, `Welcome back, ${gameDataManager.getCurrentUsername()}!`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Stats container background - moved down slightly
        const statsContainer = this.add.rectangle(1024, 500, 800, 240, 0x2c3e50);
        statsContainer.setStrokeStyle(6, 0x34495e);
        statsContainer.setAlpha(0.9);

        // Player stats display - organized in columns - moved down
        this.leftStats = this.add.text(824, 460, 
            `Money: $${gameDataManager.getDollars()}\nBest Score: ${gameDataManager.getBestScore()}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'left',
            lineSpacing: 16
        }).setOrigin(0.5);

        this.rightStats = this.add.text(1224, 460, 
            `Total Hits: ${gameDataManager.getTotalHits()}\nBalls Unlocked: ${gameDataManager.getUnlockedBalls().length}/14`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'left',
            lineSpacing: 16
        }).setOrigin(0.5);

        // Current ball section - moved down
        const currentBall = gameDataManager.getCurrentBall();
        
        // Ball preview - positioned to the left outside the box
        const ballPreview = this.add.image(600, 780, 'ball');
        ballPreview.setScale(currentBall.scale * 4.4);
        ballPreview.setTint(currentBall.color);
        
        // Current ball container - centered for the text content
        const ballContainer = this.add.rectangle(1024, 780, 700, 240, 0x34495e);
        ballContainer.setStrokeStyle(6, 0x2c3e50);
        ballContainer.setAlpha(0.9);

        this.add.text(1024, 680, 'CURRENT BALL', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ecf0f1',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Ball name and info - centered in the container
        this.add.text(1024, 750, currentBall.name, {
            fontFamily: 'Arial Black', fontSize: 40, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(1024, 810, 
            `Scale: ${currentBall.scale} • Bounce: ${currentBall.bounce}\nJump: ${currentBall.jumpPower}`, {
            fontFamily: 'Arial Black', fontSize: 28, color: '#bdc3c7',
            stroke: '#000000', strokeThickness: 4,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Buttons section
        this.createStyledButtons();

        // Instructions - cleaner and more subtle
        this.add.text(1024, 1400, 'Hit the ball to earn money and unlock amazing new balls with special abilities!', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#7f8c8d',
            stroke: '#000000', strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 1400, useAdvancedWrap: true }
        }).setOrigin(0.5);

        // Add subtle floating particles instead of balls
        this.createFloatingParticles();

        // Load the all-time high score
        this.loadAllTimeHighScore();

        // Refresh all-time high score when returning to this scene
        this.events.on('resume', () => {
            this.loadAllTimeHighScore();
        });
    }

    async createAllTimeHighScoreDisplay() {
        // Create container for all-time high score
        const highScoreContainer = this.add.rectangle(1024, 340, 1000, 100, 0x8e44ad);
        highScoreContainer.setStrokeStyle(6, 0x9b59b6);
        highScoreContainer.setAlpha(0.9);

        // Add crown icon effect
        const crown = this.add.text(800, 340, '👑', {
            fontSize: 40,
            align: 'center'
        }).setOrigin(0.5);

        // All-time high score text (placeholder)
        this.allTimeHighScoreText = this.add.text(1024, 340, 'Loading global record...', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Add sparkle effect
        const sparkle = this.add.text(1248, 340, '✨', {
            fontSize: 40,
            align: 'center'
        }).setOrigin(0.5);

        // Animate sparkle
        this.tweens.add({
            targets: sparkle,
            alpha: 0.3,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    async loadAllTimeHighScore() {
        try {
            // Initialize Firebase service if not already done
            if (!firebaseService.isOnline()) {
                await firebaseService.init();
            }

            // Get high scores
            const highScores = await firebaseService.getHighScores();
            
            if (highScores && highScores.length > 0) {
                this.allTimeHighScore = highScores[0];
                this.allTimeHighScoreText.setText(`GLOBAL RECORD: ${this.allTimeHighScore.score} by ${this.allTimeHighScore.username}`);
                
                // Add a subtle success animation
                this.tweens.add({
                    targets: this.allTimeHighScoreText,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 300,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });
            } else {
                this.allTimeHighScoreText.setText('No global records yet - be the first!');
                this.allTimeHighScoreText.setColor('#e67e22');
            }
        } catch (error) {
            console.warn('Failed to load all-time high score:', error);
            this.allTimeHighScoreText.setText('Global record unavailable');
            this.allTimeHighScoreText.setColor('#7f8c8d');
        }
    }

    createStyledButtons() {
        // Start button with better styling
        this.startButton = this.add.rectangle(1024, 960, 560, 110, 0x27ae60);
        this.startButton.setStrokeStyle(8, 0x229954);
        this.startButton.setInteractive();
        
        // Add glow effect
        const startGlow = this.add.rectangle(1024, 960, 560, 110, 0x2ecc71);
        startGlow.setAlpha(0.3);
        startGlow.setVisible(false);
        
        this.startButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
        this.startButton.on('pointerover', () => {
            this.startButton.setFillStyle(0x2ecc71);
            this.startButton.setScale(1.05);
            startGlow.setVisible(true);
        });
        this.startButton.on('pointerout', () => {
            this.startButton.setFillStyle(0x27ae60);
            this.startButton.setScale(1);
            startGlow.setVisible(false);
        });

        this.add.text(1024, 960, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Shop button with better styling
        this.shopButton = this.add.rectangle(1024, 1100, 560, 110, 0x3498db);
        this.shopButton.setStrokeStyle(8, 0x2980b9);
        this.shopButton.setInteractive();
        
        // Add glow effect
        const shopGlow = this.add.rectangle(1024, 1100, 560, 110, 0x5dade2);
        shopGlow.setAlpha(0.3);
        shopGlow.setVisible(false);
        
        this.shopButton.on('pointerdown', () => {
            this.scene.start('Shop');
        });
        this.shopButton.on('pointerover', () => {
            this.shopButton.setFillStyle(0x5dade2);
            this.shopButton.setScale(1.05);
            shopGlow.setVisible(true);
        });
        this.shopButton.on('pointerout', () => {
            this.shopButton.setFillStyle(0x3498db);
            this.shopButton.setScale(1);
            shopGlow.setVisible(false);
        });

        this.add.text(1024, 1100, 'BALL SHOP', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // High Scores button
        this.highScoresButton = this.add.rectangle(1024, 1240, 560, 110, 0xe67e22);
        this.highScoresButton.setStrokeStyle(8, 0xd68910);
        this.highScoresButton.setInteractive();
        
        // Add glow effect
        const highScoresGlow = this.add.rectangle(1024, 1240, 560, 110, 0xf39c12);
        highScoresGlow.setAlpha(0.3);
        highScoresGlow.setVisible(false);
        
        this.highScoresButton.on('pointerdown', () => {
            this.scene.start('HighScores');
        });
        this.highScoresButton.on('pointerover', () => {
            this.highScoresButton.setFillStyle(0xf39c12);
            this.highScoresButton.setScale(1.05);
            highScoresGlow.setVisible(true);
        });
        this.highScoresButton.on('pointerout', () => {
            this.highScoresButton.setFillStyle(0xe67e22);
            this.highScoresButton.setScale(1);
            highScoresGlow.setVisible(false);
        });

        this.add.text(1024, 1240, 'HIGH SCORES', {
            fontFamily: 'Arial Black', fontSize: 44, color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Change Username button (smaller, in corner)
        this.changeUsernameButton = this.add.rectangle(1800, 200, 320, 80, 0x95a5a6);
        this.changeUsernameButton.setStrokeStyle(6, 0x7f8c8d);
        this.changeUsernameButton.setInteractive();
        
        this.changeUsernameButton.on('pointerdown', () => {
            this.scene.start('UsernameInput');
        });
        this.changeUsernameButton.on('pointerover', () => {
            this.changeUsernameButton.setFillStyle(0xbdc3c7);
            this.changeUsernameButton.setScale(1.05);
        });
        this.changeUsernameButton.on('pointerout', () => {
            this.changeUsernameButton.setFillStyle(0x95a5a6);
            this.changeUsernameButton.setScale(1);
        });

        this.add.text(1800, 200, 'CHANGE USER', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
    }

    createFloatingParticles() {
        // Create subtle floating particles instead of balls
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(100, 1948);
            const y = Phaser.Math.Between(100, 300);
            
            const particle = this.add.circle(x, y, 6, 0x3498db);
            particle.setAlpha(0.4);
            
            // Add floating animation
            this.tweens.add({
                targets: particle,
                y: y - 60,
                duration: 3000 + Math.random() * 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Add gentle horizontal drift
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 100,
                duration: 4000 + Math.random() * 3000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Add pulsing effect
            this.tweens.add({
                targets: particle,
                alpha: 0.1,
                duration: 2000 + Math.random() * 1000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    update() {
        // Update stats display (in case player comes back from shop)
        // This ensures the display is always current
        if (this.leftStats) {
            this.leftStats.setText(`Money: $${gameDataManager.getDollars()}\nBest Score: ${gameDataManager.getBestScore()}`);
        }
        if (this.rightStats) {
            this.rightStats.setText(`Total Hits: ${gameDataManager.getTotalHits()}\nBalls Unlocked: ${gameDataManager.getUnlockedBalls().length}/14`);
        }
    }
}