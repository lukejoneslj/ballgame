import { gameDataManager } from './DataManager.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    create() {
        // Check if username is set, if not redirect to username input
        if (!gameDataManager.getCurrentUsername()) {
            this.scene.start('UsernameInput');
            return;
        }

        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.add.image(512, 384, 'background').setAlpha(0.2);

        // Main title - more prominent
        this.add.text(512, 80, 'BALL BOUNCE', {
            fontFamily: 'Arial Black', fontSize: 68, color: '#ffffff',
            stroke: '#000000', strokeThickness: 12,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle - better styling
        this.add.text(512, 140, 'ULTIMATE EDITION', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#00d4ff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Welcome message with username
        this.add.text(512, 170, `Welcome back, ${gameDataManager.getCurrentUsername()}!`, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Stats container background
        const statsContainer = this.add.rectangle(512, 220, 400, 120, 0x2c3e50);
        statsContainer.setStrokeStyle(3, 0x34495e);
        statsContainer.setAlpha(0.9);

        // Player stats display - organized in columns
        this.leftStats = this.add.text(412, 200, 
            `Money: $${gameDataManager.getDollars()}\nBest Score: ${gameDataManager.getBestScore()}`, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'left',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.rightStats = this.add.text(612, 200, 
            `Total Hits: ${gameDataManager.getTotalHits()}\nBalls Unlocked: ${gameDataManager.getUnlockedBalls().length}/14`, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'left',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Current ball section
        const currentBall = gameDataManager.getCurrentBall();
        
        // Ball preview - positioned to the left outside the box
        const ballPreview = this.add.image(300, 360, 'ball');
        ballPreview.setScale(currentBall.scale * 2.2);
        ballPreview.setTint(currentBall.color);
        
        // Current ball container - centered for the text content
        const ballContainer = this.add.rectangle(512, 360, 350, 120, 0x34495e);
        ballContainer.setStrokeStyle(3, 0x2c3e50);
        ballContainer.setAlpha(0.9);

        this.add.text(512, 310, 'CURRENT BALL', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ecf0f1',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Ball name and info - centered in the container
        this.add.text(512, 345, currentBall.name, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 375, 
            `Scale: ${currentBall.scale} • Bounce: ${currentBall.bounce}\nJump: ${currentBall.jumpPower}`, {
            fontFamily: 'Arial Black', fontSize: 14, color: '#bdc3c7',
            stroke: '#000000', strokeThickness: 2,
            align: 'center',
            lineSpacing: 4
        }).setOrigin(0.5);

        // Buttons section
        this.createStyledButtons();

        // Instructions - cleaner and more subtle
        this.add.text(512, 700, 'Hit the ball to earn money and unlock amazing new balls with special abilities!', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#7f8c8d',
            stroke: '#000000', strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 700, useAdvancedWrap: true }
        }).setOrigin(0.5);

        // Add subtle floating particles instead of balls
        this.createFloatingParticles();
    }

    createStyledButtons() {
        // Start button with better styling
        this.startButton = this.add.rectangle(512, 480, 280, 55, 0x27ae60);
        this.startButton.setStrokeStyle(4, 0x229954);
        this.startButton.setInteractive();
        
        // Add glow effect
        const startGlow = this.add.rectangle(512, 480, 280, 55, 0x2ecc71);
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

        this.add.text(512, 480, 'START GAME', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff',
            stroke: '#000000', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        // Shop button with better styling
        this.shopButton = this.add.rectangle(512, 550, 280, 55, 0x3498db);
        this.shopButton.setStrokeStyle(4, 0x2980b9);
        this.shopButton.setInteractive();
        
        // Add glow effect
        const shopGlow = this.add.rectangle(512, 550, 280, 55, 0x5dade2);
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

        this.add.text(512, 550, 'BALL SHOP', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff',
            stroke: '#000000', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        // High Scores button
        this.highScoresButton = this.add.rectangle(512, 620, 280, 55, 0xe67e22);
        this.highScoresButton.setStrokeStyle(4, 0xd68910);
        this.highScoresButton.setInteractive();
        
        // Add glow effect
        const highScoresGlow = this.add.rectangle(512, 620, 280, 55, 0xf39c12);
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

        this.add.text(512, 620, 'HIGH SCORES', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff',
            stroke: '#000000', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        // Change Username button (smaller, in corner)
        this.changeUsernameButton = this.add.rectangle(900, 100, 160, 40, 0x95a5a6);
        this.changeUsernameButton.setStrokeStyle(3, 0x7f8c8d);
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

        this.add.text(900, 100, 'CHANGE USER', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
    }

    createFloatingParticles() {
        // Create subtle floating particles instead of balls
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, 974);
            const y = Phaser.Math.Between(50, 150);
            
            const particle = this.add.circle(x, y, 3, 0x3498db);
            particle.setAlpha(0.4);
            
            // Add floating animation
            this.tweens.add({
                targets: particle,
                y: y - 30,
                duration: 3000 + Math.random() * 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Add gentle horizontal drift
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 50,
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