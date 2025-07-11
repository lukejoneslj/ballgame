import { gameDataManager } from './DataManager.js';

export class UsernameInput extends Phaser.Scene {
    constructor() {
        super('UsernameInput');
        this.usernameInput = '';
        this.maxLength = 15;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.add.image(512, 384, 'background').setAlpha(0.2);

        // Title
        this.add.text(512, 150, 'ENTER USERNAME', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 10,
            align: 'center'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(512, 220, 'Enter your username to save your progress', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#00d4ff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Input box background
        this.inputBox = this.add.rectangle(512, 320, 400, 80, 0x2c3e50);
        this.inputBox.setStrokeStyle(4, 0x3498db);

        // Input text display
        this.inputText = this.add.text(512, 320, '', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Cursor
        this.cursor = this.add.text(512, 320, '|', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Blinking cursor animation
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Instructions
        this.add.text(512, 380, 'Type your username and press ENTER', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#7f8c8d',
            stroke: '#000000', strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 410, 'Letters, numbers, and underscores only (3-15 characters)', {
            fontFamily: 'Arial Black', fontSize: 14, color: '#7f8c8d',
            stroke: '#000000', strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // Continue button
        this.continueButton = this.add.rectangle(512, 500, 200, 55, 0x27ae60);
        this.continueButton.setStrokeStyle(4, 0x229954);
        this.continueButton.setInteractive();
        this.continueButton.setAlpha(0.5);

        this.continueButtonText = this.add.text(512, 500, 'CONTINUE', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.continueButton.on('pointerdown', () => {
            this.submitUsername();
        });

        // Skip button for anonymous play
        this.skipButton = this.add.rectangle(512, 580, 200, 55, 0x95a5a6);
        this.skipButton.setStrokeStyle(4, 0x7f8c8d);
        this.skipButton.setInteractive();

        this.skipButtonText = this.add.text(512, 580, 'SKIP', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.skipButton.on('pointerdown', () => {
            this.scene.start('Start');
        });

        this.skipButton.on('pointerover', () => {
            this.skipButton.setFillStyle(0xbdc3c7);
        });

        this.skipButton.on('pointerout', () => {
            this.skipButton.setFillStyle(0x95a5a6);
        });

        // Error message
        this.errorText = this.add.text(512, 450, '', {
            fontFamily: 'Arial Black', fontSize: 16, color: '#e74c3c',
            stroke: '#000000', strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Setup keyboard input
        this.setupKeyboardInput();

        // Load existing username if any
        const existingUsername = gameDataManager.getCurrentUsername();
        if (existingUsername) {
            this.usernameInput = existingUsername;
            this.updateDisplay();
        }
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Enter') {
                this.submitUsername();
            } else if (event.key === 'Backspace') {
                this.usernameInput = this.usernameInput.slice(0, -1);
                this.updateDisplay();
            } else if (event.key.length === 1) {
                // Only allow alphanumeric characters and underscores
                if (/^[a-zA-Z0-9_]$/.test(event.key) && this.usernameInput.length < this.maxLength) {
                    this.usernameInput += event.key;
                    this.updateDisplay();
                }
            }
        });
    }

    updateDisplay() {
        this.inputText.setText(this.usernameInput);
        
        // Update cursor position
        const textWidth = this.inputText.width;
        this.cursor.setX(512 + textWidth / 2 + 10);
        
        // Update continue button state
        const isValidUsername = this.isValidUsername(this.usernameInput);
        if (isValidUsername) {
            this.continueButton.setAlpha(1);
            this.continueButton.setFillStyle(0x27ae60);
            this.continueButton.on('pointerover', () => {
                this.continueButton.setFillStyle(0x2ecc71);
            });
            this.continueButton.on('pointerout', () => {
                this.continueButton.setFillStyle(0x27ae60);
            });
        } else {
            this.continueButton.setAlpha(0.5);
            this.continueButton.setFillStyle(0x7f8c8d);
            this.continueButton.removeAllListeners('pointerover');
            this.continueButton.removeAllListeners('pointerout');
        }
        
        // Clear error message
        this.errorText.setText('');
    }

    isValidUsername(username) {
        return username.length >= 3 && 
               username.length <= this.maxLength && 
               /^[a-zA-Z0-9_]+$/.test(username);
    }

    submitUsername() {
        if (!this.isValidUsername(this.usernameInput)) {
            this.errorText.setText('Username must be 3-15 characters, letters/numbers/underscores only');
            return;
        }

        // Set the username in the data manager
        if (gameDataManager.setUsername(this.usernameInput)) {
            this.scene.start('Start');
        } else {
            this.errorText.setText('Error setting username. Please try again.');
        }
    }

    update() {
        // Keep the scene responsive
    }
} 