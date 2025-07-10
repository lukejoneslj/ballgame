import { gameDataManager } from './DataManager.js';

export class Shop extends Phaser.Scene {
    constructor() {
        super('Shop');
        this.selectedBallIndex = 0;
        this.ballButtons = [];
        this.ballPreviews = [];
    }

    create() {
        this.cameras.main.setBackgroundColor(0x2c3e50);

        // Title
        this.add.text(512, 50, 'BALL SHOP', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Currency display
        this.currencyText = this.add.text(50, 50, `Money: $${gameDataManager.getDollars()}`, {
            fontFamily: 'Arial Black', fontSize: 24, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Stats display
        this.statsText = this.add.text(50, 80, 
            `Total Hits: ${gameDataManager.getTotalHits()}\nBest Score: ${gameDataManager.getBestScore()}`, {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Back button - improved positioning and size
        this.backButton = this.add.rectangle(100, 680, 140, 55, 0xe74c3c);
        this.backButton.setStrokeStyle(3, 0xc0392b);
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => {
            this.scene.start('Start');
        });
        this.backButton.on('pointerover', () => {
            this.backButton.setFillStyle(0xe67e22);
        });
        this.backButton.on('pointerout', () => {
            this.backButton.setFillStyle(0xe74c3c);
        });

        this.add.text(100, 680, 'BACK', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Create ball selection grid
        this.createBallGrid();

        // Ball preview area
        this.createBallPreview();

        // Purchase/Select button
        this.createActionButton();
    }

    createBallGrid() {
        const balls = gameDataManager.getAllBalls();
        const ballIds = Object.keys(balls);
        
        const startX = 130;
        const startY = 200;
        const spacing = 120;
        const itemsPerRow = 4;

        ballIds.forEach((ballId, index) => {
            const ball = balls[ballId];
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            // Check if ball is unlocked - use consistent unlock check
            const isUnlocked = gameDataManager.gameData.unlockedBalls.includes(ballId);

            // Ball container
            const container = this.add.container(x, y);
            
            // Background circle
            const bg = this.add.circle(0, 0, 45, isUnlocked ? 0x34495e : 0x7f8c8d);
            bg.setStrokeStyle(3, isUnlocked ? 0x2c3e50 : 0x95a5a6);
            container.add(bg);

            // Ball preview
            const ballPreview = this.add.image(0, 0, 'ball');
            ballPreview.setScale(ball.scale * 0.8);
            ballPreview.setTint(ball.color);
            if (!isUnlocked) {
                ballPreview.setAlpha(0.5);
            }
            container.add(ballPreview);

            // Ball name - improved positioning and text wrapping
            const nameText = this.add.text(0, 65, ball.name, {
                fontFamily: 'Arial Black', fontSize: 12, color: '#ffffff',
                stroke: '#000000', strokeThickness: 2,
                align: 'center',
                wordWrap: { width: 100, useAdvancedWrap: true }
            }).setOrigin(0.5);
            container.add(nameText);

            // Selected indicator - larger for better visibility
            if (ballId === gameDataManager.gameData.currentBall) {
                const selectedRing = this.add.circle(0, 0, 50, 0x00ff00, 0);
                selectedRing.setStrokeStyle(4, 0x00ff00);
                container.add(selectedRing);
                this.selectedBallIndex = index;
            }

            // Make interactive
            bg.setInteractive();
            bg.on('pointerdown', () => {
                this.selectBall(ballId, index);
            });
            bg.on('pointerover', () => {
                bg.setFillStyle(isUnlocked ? 0x4a6741 : 0x95a5a6);
            });
            bg.on('pointerout', () => {
                bg.setFillStyle(isUnlocked ? 0x34495e : 0x7f8c8d);
            });

            this.ballButtons.push({
                container: container,
                ballId: ballId,
                bg: bg,
                ballData: ball
            });
        });
    }

    createBallPreview() {
        // Preview area background - improved size and position
        const previewBg = this.add.rectangle(770, 400, 340, 520, 0x34495e);
        previewBg.setStrokeStyle(3, 0x2c3e50);

        this.add.text(770, 160, 'PREVIEW', {
            fontFamily: 'Arial Black', fontSize: 26, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Ball preview - better positioning
        const currentBall = gameDataManager.getCurrentBall();
        this.ballPreview = this.add.image(770, 260, 'ball');
        this.ballPreview.setScale(currentBall.scale * 2);
        this.ballPreview.setTint(currentBall.color);

        // Ball name - separate from description
        this.ballNameText = this.add.text(770, 330, currentBall.name, {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Ball description - improved formatting
        this.ballDescText = this.add.text(770, 380, currentBall.description, {
            fontFamily: 'Arial Black', fontSize: 14, color: '#ecf0f1',
            stroke: '#000000', strokeThickness: 2,
            align: 'center',
            wordWrap: { width: 300, useAdvancedWrap: true },
            lineSpacing: 4
        }).setOrigin(0.5);

        // Ball stats - better formatting and spacing
        this.ballStatsText = this.add.text(770, 450, 
            `Scale: ${currentBall.scale}\nBounce: ${currentBall.bounce}\nJump: ${currentBall.jumpPower}`, {
            fontFamily: 'Arial Black', fontSize: 16, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Price display - show cost for locked balls
        const isCurrentBallUnlocked = gameDataManager.gameData.unlockedBalls.includes(gameDataManager.gameData.currentBall);
        if (!isCurrentBallUnlocked && currentBall.cost > 0) {
            this.ballPriceText = this.add.text(770, 500, `PRICE: $${currentBall.cost}`, {
                fontFamily: 'Arial Black', fontSize: 18, color: '#f1c40f',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
        }

        // Special ability text - better positioning
        if (currentBall.special) {
            let specialText = '';
            switch (currentBall.special) {
                case 'magnetism':
                    specialText = 'SPECIAL: Attracts Power-ups';
                    break;
                case 'doubleMoney':
                    specialText = 'SPECIAL: Double Money';
                    break;
                case 'slippery':
                    specialText = 'SPECIAL: Unpredictable Movement';
                    break;
                case 'burning':
                    specialText = 'SPECIAL: Fire Particles';
                    break;
                case 'electric':
                    specialText = 'SPECIAL: Electric Sparks';
                    break;
                case 'giant':
                    specialText = 'SPECIAL: Massive Size';
                    break;
                case 'tiny':
                    specialText = 'SPECIAL: Ultra Small & Fast';
                    break;
                case 'rainbow':
                    specialText = 'SPECIAL: Color Changing';
                    break;
                case 'ghost':
                    specialText = 'SPECIAL: Phases Through Walls';
                    break;
                case 'diamond':
                    specialText = 'SPECIAL: Ultimate Luxury';
                    break;
            }
            
            this.specialText = this.add.text(770, 550, specialText, {
                fontFamily: 'Arial Black', fontSize: 15, color: '#f1c40f',
                stroke: '#000000', strokeThickness: 3,
                align: 'center',
                wordWrap: { width: 300, useAdvancedWrap: true }
            }).setOrigin(0.5);
        }
    }

    createActionButton() {
        this.actionButton = this.add.rectangle(770, 620, 240, 55, 0x27ae60);
        this.actionButton.setStrokeStyle(3, 0x229954);
        this.actionButton.setInteractive();
        
        this.actionButtonText = this.add.text(770, 620, 'EQUIPPED', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.actionButton.on('pointerdown', () => {
            this.handleActionButton();
        });
    }

    selectBall(ballId, index) {
        this.selectedBallIndex = index;
        const ball = gameDataManager.getAllBalls()[ballId];
        
        // Update preview
        this.ballPreview.setScale(ball.scale * 2);
        this.ballPreview.setTint(ball.color);
        
        // Update info text with new separated elements
        this.ballNameText.setText(ball.name);
        this.ballDescText.setText(ball.description);
        this.ballStatsText.setText(
            `Scale: ${ball.scale}\nBounce: ${ball.bounce}\nJump: ${ball.jumpPower}`
        );

        // Update price display - destroy existing price text first
        if (this.ballPriceText) {
            this.ballPriceText.destroy();
            this.ballPriceText = null;
        }

        // Show price for locked balls
        const isBallUnlocked = gameDataManager.gameData.unlockedBalls.includes(ballId);
        if (!isBallUnlocked && ball.cost > 0) {
            this.ballPriceText = this.add.text(770, 500, `PRICE: $${ball.cost}`, {
                fontFamily: 'Arial Black', fontSize: 18, color: '#f1c40f',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
        }

        // Update special text
        if (this.specialText) {
            this.specialText.destroy();
            this.specialText = null;
        }
        
        if (ball.special) {
            let specialText = '';
            switch (ball.special) {
                case 'magnetism':
                    specialText = 'SPECIAL: Attracts Power-ups';
                    break;
                case 'doubleMoney':
                    specialText = 'SPECIAL: Double Money';
                    break;
                case 'slippery':
                    specialText = 'SPECIAL: Unpredictable Movement';
                    break;
                case 'burning':
                    specialText = 'SPECIAL: Fire Particles';
                    break;
                case 'electric':
                    specialText = 'SPECIAL: Electric Sparks';
                    break;
                case 'giant':
                    specialText = 'SPECIAL: Massive Size';
                    break;
                case 'tiny':
                    specialText = 'SPECIAL: Ultra Small & Fast';
                    break;
                case 'rainbow':
                    specialText = 'SPECIAL: Color Changing';
                    break;
                case 'ghost':
                    specialText = 'SPECIAL: Phases Through Walls';
                    break;
                case 'diamond':
                    specialText = 'SPECIAL: Ultimate Luxury';
                    break;
            }
            
            this.specialText = this.add.text(770, 550, specialText, {
                fontFamily: 'Arial Black', fontSize: 15, color: '#f1c40f',
                stroke: '#000000', strokeThickness: 3,
                align: 'center',
                wordWrap: { width: 300, useAdvancedWrap: true }
            }).setOrigin(0.5);
        }

        // Update action button - use consistent unlock check
        const isUnlocked = gameDataManager.gameData.unlockedBalls.includes(ballId);
        if (isUnlocked) {
            if (ballId === gameDataManager.gameData.currentBall) {
                this.actionButton.setFillStyle(0x27ae60);
                this.actionButtonText.setText('EQUIPPED');
            } else {
                this.actionButton.setFillStyle(0x3498db);
                this.actionButtonText.setText('EQUIP');
            }
        } else {
            if (gameDataManager.canAfford(ballId)) {
                this.actionButton.setFillStyle(0xe67e22);
                this.actionButtonText.setText(`BUY $${ball.cost}`);
            } else {
                this.actionButton.setFillStyle(0x95a5a6);
                this.actionButtonText.setText('TOO EXPENSIVE');
            }
        }

        // Update selection indicators
        this.ballButtons.forEach((button, buttonIndex) => {
            // Remove old selection rings
            button.container.list.forEach(child => {
                if (child.type === 'Arc' && child.strokeColor === 0x00ff00) {
                    child.destroy();
                }
            });
            
            // Add new selection ring if this is the selected ball
            if (buttonIndex === index) {
                const selectedRing = this.add.circle(0, 0, 50, 0x00ff00, 0);
                selectedRing.setStrokeStyle(4, 0x00ff00);
                button.container.add(selectedRing);
            }
        });
    }

    handleActionButton() {
        const ballIds = Object.keys(gameDataManager.getAllBalls());
        const selectedBallId = ballIds[this.selectedBallIndex];
        const ball = gameDataManager.getAllBalls()[selectedBallId];

        // Use consistent unlock check
        const isUnlocked = gameDataManager.gameData.unlockedBalls.includes(selectedBallId);
        if (isUnlocked) {
            if (selectedBallId !== gameDataManager.gameData.currentBall) {
                // Equip the ball
                gameDataManager.selectBall(selectedBallId);
                this.actionButton.setFillStyle(0x27ae60);
                this.actionButtonText.setText('EQUIPPED');
                
                // Update all ball selection indicators
                this.ballButtons.forEach((button, index) => {
                    // Remove old equipped rings
                    button.container.list.forEach(child => {
                        if (child.type === 'Arc' && child.strokeColor === 0x00ff00) {
                            child.destroy();
                        }
                    });
                    
                    // Add equipped ring to newly selected ball
                    if (button.ballId === selectedBallId) {
                        const selectedRing = this.add.circle(0, 0, 50, 0x00ff00, 0);
                        selectedRing.setStrokeStyle(4, 0x00ff00);
                        button.container.add(selectedRing);
                    }
                });
            }
        } else {
            // Try to buy the ball
            if (gameDataManager.buyBall(selectedBallId)) {
                // Purchase successful
                this.actionButton.setFillStyle(0x3498db);
                this.actionButtonText.setText('EQUIP');
                
                // Update the ball button to show it's unlocked
                const ballButton = this.ballButtons[this.selectedBallIndex];
                ballButton.bg.setFillStyle(0x34495e);
                ballButton.container.list.forEach(child => {
                    if (child.type === 'Image') {
                        child.setAlpha(1);
                    }
                    if (child.type === 'Text' && child.text.includes('$')) {
                        child.destroy();
                    }
                });
                
                // Update currency display
                this.currencyText.setText(`Money: $${gameDataManager.getDollars()}`);
                
                // Clear price display since ball is now unlocked
                if (this.ballPriceText) {
                    this.ballPriceText.destroy();
                    this.ballPriceText = null;
                }
            }
        }
    }

    update() {
        // Update currency display
        this.currencyText.setText(`Money: $${gameDataManager.getDollars()}`);
    }
} 