import { gameDataManager } from './DataManager.js';

export class HighScores extends Phaser.Scene {
    constructor() {
        super('HighScores');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.add.image(512, 384, 'background').setAlpha(0.2);

        // Title
        this.add.text(512, 80, 'HIGH SCORES', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(512, 130, 'TOP PLAYERS', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#f1c40f',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // High scores container
        const scoresContainer = this.add.rectangle(512, 400, 600, 480, 0x2c3e50);
        scoresContainer.setStrokeStyle(4, 0x34495e);
        scoresContainer.setAlpha(0.9);

        // Loading text
        this.loadingText = this.add.text(512, 350, 'Loading scores...', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#7f8c8d',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Load high scores asynchronously
        this.loadHighScores();

        // Create UI elements
        this.createUI();

        // Back button
        this.backButton = this.add.rectangle(150, 700, 180, 55, 0xe74c3c);
        this.backButton.setStrokeStyle(4, 0xc0392b);
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
        this.backButton.on('pointerover', () => {
            this.backButton.setFillStyle(0xe67e22);
            this.backButton.setScale(1.05);
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setFillStyle(0xe74c3c);
            this.backButton.setScale(1);
        });

        this.add.text(150, 700, 'BACK', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Refresh button
        this.refreshButton = this.add.rectangle(874, 700, 180, 55, 0x3498db);
        this.refreshButton.setStrokeStyle(4, 0x2980b9);
        this.refreshButton.setInteractive();
        this.refreshButton.on('pointerdown', () => {
            this.scene.restart();
        });
        this.refreshButton.on('pointerover', () => {
            this.refreshButton.setFillStyle(0x5dade2);
            this.refreshButton.setScale(1.05);
        });
        this.refreshButton.on('pointerout', () => {
            this.refreshButton.setFillStyle(0x3498db);
            this.refreshButton.setScale(1);
        });

        this.add.text(874, 700, 'REFRESH', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Username info
        if (currentUsername) {
            this.add.text(512, 750, `Playing as: ${currentUsername}`, {
                fontFamily: 'Arial Black', fontSize: 14, color: '#7f8c8d',
                stroke: '#000000', strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5);
        }

        // Add floating particles
        this.createFloatingParticles();
    }

    async loadHighScores() {
        try {
            const highScores = await gameDataManager.getHighScores();
            const currentUsername = gameDataManager.getCurrentUsername();
            
            // Clear loading text
            if (this.loadingText) {
                this.loadingText.destroy();
            }
            
            // Display scores
            this.displayScores(highScores, currentUsername);
            
            // Show player stats
            if (currentUsername) {
                await this.showPlayerStats(currentUsername);
            }
        } catch (error) {
            console.warn('Error loading high scores:', error);
            if (this.loadingText) {
                this.loadingText.setText('Failed to load scores');
            }
        }
    }

    createUI() {
        // Header
        this.add.text(300, 180, 'RANK', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#bdc3c7',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(500, 180, 'PLAYER', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#bdc3c7',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(700, 180, 'SCORE', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#bdc3c7',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
    }

    displayScores(highScores, currentUsername) {
        if (highScores.length === 0) {
            this.add.text(512, 350, 'No high scores yet!\nBe the first to set a record!', {
                fontFamily: 'Arial Black', fontSize: 20, color: '#7f8c8d',
                stroke: '#000000', strokeThickness: 4,
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);
        } else {
            for (let i = 0; i < Math.min(highScores.length, 10); i++) {
                const score = highScores[i];
                const yPos = 220 + (i * 35);
                
                // Highlight current player
                const isCurrentPlayer = score.username === currentUsername;
                const textColor = isCurrentPlayer ? '#f1c40f' : '#ffffff';
                const strokeColor = isCurrentPlayer ? '#d68910' : '#000000';
                
                // Rank
                let rankText = `${i + 1}`;
                if (i === 0) rankText = '🏆 ' + rankText;
                else if (i === 1) rankText = '🥈 ' + rankText;
                else if (i === 2) rankText = '🥉 ' + rankText;
                
                this.add.text(300, yPos, rankText, {
                    fontFamily: 'Arial Black', fontSize: 16, color: textColor,
                    stroke: strokeColor, strokeThickness: 3,
                    align: 'center'
                }).setOrigin(0.5);

                // Player name
                let displayName = score.username;
                if (displayName.length > 15) {
                    displayName = displayName.substring(0, 12) + '...';
                }
                
                this.add.text(500, yPos, displayName, {
                    fontFamily: 'Arial Black', fontSize: 16, color: textColor,
                    stroke: strokeColor, strokeThickness: 3,
                    align: 'center'
                }).setOrigin(0.5);

                // Score
                this.add.text(700, yPos, score.score.toLocaleString(), {
                    fontFamily: 'Arial Black', fontSize: 16, color: textColor,
                    stroke: strokeColor, strokeThickness: 3,
                    align: 'center'
                }).setOrigin(0.5);
            }
        }
    }

    async showPlayerStats(currentUsername) {
        try {
            const playerBestScore = gameDataManager.getBestScore();
            const playerRank = await gameDataManager.getPlayerRank(playerBestScore);
            
            this.add.text(512, 650, `Your Best: ${playerBestScore.toLocaleString()} (Rank: ${playerRank})`, {
                fontFamily: 'Arial Black', fontSize: 18, color: '#00d4ff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
        } catch (error) {
            console.warn('Error showing player stats:', error);
        }
    }

    createFloatingParticles() {
        // Create subtle floating particles
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, 974);
            const y = Phaser.Math.Between(50, 100);
            
            const particle = this.add.circle(x, y, 2, 0xf1c40f);
            particle.setAlpha(0.3);
            
            // Add floating animation
            this.tweens.add({
                targets: particle,
                y: y - 20,
                duration: 3000 + Math.random() * 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // Add gentle horizontal drift
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 30,
                duration: 4000 + Math.random() * 3000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    update() {
        // Scene is responsive
    }
} 