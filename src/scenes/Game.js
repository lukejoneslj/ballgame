/*
* The ball asset is taken from: https://gamedeveloperstudio.itch.io/balls
*
*/

import { gameDataManager } from './DataManager.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.score = 0;
        this.targetRadius = 200; // Initial radius of the clickable area (doubled for new resolution)
        this.minTargetRadius = 40; // Minimum radius to prevent it from getting too small (doubled)
        this.shrinkAmount = 20; // Amount to shrink by each time (doubled)
        
        // Power-up system
        this.powerUps = [];
        this.activePowerUps = {
            slowMotion: { active: false, timer: 0 },
            bigTarget: { active: false, timer: 0 },
            doublePoints: { active: false, timer: 0 },
            freezeShrink: { active: false, timer: 0 }
        };
        
        // Ball trail system - simplified to line trail
        this.trailPoints = [];
        this.maxTrailPoints = 20;
        this.trailLifetime = 1000; // 1 second in milliseconds
        
        // Magnetism effect for magnetic ball
        this.magneticRange = 200;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00ff00);

        this.add.image(1024, 768, 'background').setAlpha(0.5);

        // Create tutorial text
        const tutorialText = this.add.text(1024, 1168, 'Tap inside the circle to make the ball jump!\nTarget area shrinks every 10 seconds!\nHit the ball into power-ups to collect them!\nEarn $1 per hit!', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 16,
            align: 'center'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(1024, 100, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 56, color: '#ffffff',
            stroke: '#000000', strokeThickness: 16,
            align: 'center'
        }).setOrigin(0.5);

        // Create currency display
        this.currencyText = this.add.text(100, 100, `$${gameDataManager.getDollars()}`, {
            fontFamily: 'Arial Black', fontSize: 48, color: '#00ff00',
            stroke: '#000000', strokeThickness: 12,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Create ball info display
        const currentBall = gameDataManager.getCurrentBall();
        this.ballInfoText = this.add.text(100, 160, `Ball: ${currentBall.name}`, {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Create difficulty indicator text
        this.difficultyText = this.add.text(100, 220, 'Target Size: 100', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Create countdown text
        this.countdownText = this.add.text(100, 280, 'Next shrink in: 10s', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Create power-up status text
        this.powerUpText = this.add.text(100, 340, '', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6,
            align: 'left'
        }).setOrigin(0, 0.5);

        // Removed shop button - now only accessible from start screen

        // Let's create our ball with current ball properties
        this.createBall();

        // Create the target circle (visual indicator)
        this.targetCircle = this.add.circle(this.ball.x, this.ball.y, this.targetRadius, 0x00ffff, 0.3);
        this.targetCircle.setStrokeStyle(6, 0x00ffff);

        // Create graphics object for drawing the trail line
        this.trailGraphics = this.add.graphics();

        // Remove the ball's built-in interactivity
        // We'll handle clicks manually through the scene
        this.input.on('pointerdown', (pointer) => {
            this.handleClick(pointer.x, pointer.y, tutorialText);
        });

        // Set up timer for shrinking the target area every 10 seconds
        this.shrinkTimer = this.time.addEvent({
            delay: 10000, // 10 seconds
            callback: this.shrinkTarget,
            callbackScope: this,
            loop: true
        });

        // Set up timer for countdown display
        this.countdownTimer = this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateCountdown,
            callbackScope: this,
            loop: true
        });

        // Set up power-up spawning timer
        this.powerUpSpawnTimer = this.time.addEvent({
            delay: 15000, // 15 seconds
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        this.timeUntilShrink = 10; // seconds

        // Create a ground object at the bottom of the screen
        const ground = this.add.rectangle(1024, 1536, 2048, 20, 0xFF0000);
        this.physics.add.existing(ground, true);

        // Add ground detection
        this.physics.add.collider(this.ball, ground, () => {
            this.GameOver();
        }, null, this);

        // Power-ups are now handled manually in the update loop
    }

    createBall() {
        const ballData = gameDataManager.getCurrentBall();
        
        // Create ball with current ball properties
        this.ball = this.physics.add.image(1024, 768, 'ball');
        this.ball.setScale(ballData.scale * 2); // Double the scale for the new resolution
        this.ball.setBounce(ballData.bounce);
        this.ball.setCollideWorldBounds(true);
        this.ball.body.setCircle(this.ball.width / 2);
        this.ball.setTint(ballData.color);
        
        // Store ball data for easy access
        this.ballData = ballData;
    }

    update() {
        // Update the target circle position to follow the ball
        this.targetCircle.x = this.ball.x;
        this.targetCircle.y = this.ball.y;
        
        // Update target circle size if big target power-up is active
        if (this.activePowerUps.bigTarget.active) {
            this.targetCircle.setRadius(this.targetRadius * 1.5);
        } else {
            this.targetCircle.setRadius(this.targetRadius);
        }

        // Update ball trail
        this.updateBallTrail();

        // Handle special ball effects
        this.handleSpecialEffects();

        // Check for power-up collisions manually
        this.powerUps.forEach((powerUp, index) => {
            if (powerUp.active) {
                const distance = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, powerUp.x, powerUp.y);
                if (distance < 60) { // Collision threshold (doubled for new resolution)
                    this.activatePowerUp(powerUp.getData('type'));
                    
                    // Visual feedback
                    this.cameras.main.flash(200, 255, 255, 0);
                    
                    // Remove power-up
                    this.powerUps.splice(index, 1);
                    powerUp.destroy();
                }
            }
        });

        // Update power-up timers
        this.updatePowerUps();

        // Update currency display
        this.currencyText.setText(`$${gameDataManager.getDollars()}`);
    }

    handleSpecialEffects() {
        switch (this.ballData.special) {
            case 'magnetism':
                this.handleMagneticEffect();
                break;
            case 'rainbow':
                this.handleRainbowEffect();
                break;
            case 'electric':
                this.handleElectricEffect();
                break;
            case 'ghost':
                this.handleGhostEffect();
                break;
            case 'slippery':
                this.handleSlipperyEffect();
                break;
            case 'burning':
                this.handleBurningEffect();
                break;
        }
    }

    handleMagneticEffect() {
        // Attract nearby power-ups to the ball
        this.powerUps.forEach(powerUp => {
            if (powerUp.active) {
                const distance = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, powerUp.x, powerUp.y);
                if (distance < this.magneticRange) {
                    // Calculate attraction force
                    const angle = Phaser.Math.Angle.Between(powerUp.x, powerUp.y, this.ball.x, this.ball.y);
                    const force = Math.max(0, (this.magneticRange - distance) / this.magneticRange) * 2;
                    
                    // Move power-up towards ball
                    powerUp.x += Math.cos(angle) * force;
                    powerUp.y += Math.sin(angle) * force;
                }
            }
        });
    }

    handleRainbowEffect() {
        // Change ball color over time
        const time = this.time.now * 0.005;
        const r = Math.sin(time) * 127 + 128;
        const g = Math.sin(time + 2.094) * 127 + 128;
        const b = Math.sin(time + 4.188) * 127 + 128;
        const color = (r << 16) | (g << 8) | b;
        this.ball.setTint(color);
    }

    handleElectricEffect() {
        // Random electric sparks
        if (Math.random() < 0.05) {
            const spark = this.add.circle(
                this.ball.x + Phaser.Math.Between(-40, 40),
                this.ball.y + Phaser.Math.Between(-40, 40),
                6, 0x00ffff
            );
            this.tweens.add({
                targets: spark,
                alpha: 0,
                duration: 200,
                onComplete: () => spark.destroy()
            });
        }
    }

    handleGhostEffect() {
        // Occasionally phase through walls
        if (Math.random() < 0.01) {
            this.ball.body.setCollideWorldBounds(false);
            this.ball.setAlpha(0.5);
            this.time.delayedCall(1000, () => {
                this.ball.body.setCollideWorldBounds(true);
                this.ball.setAlpha(1);
            });
        }
    }

    handleSlipperyEffect() {
        // Add random velocity changes
        if (Math.random() < 0.02) {
            const randomForce = Phaser.Math.Between(-200, 200);
            this.ball.setVelocityX(this.ball.body.velocity.x + randomForce);
        }
    }

    handleBurningEffect() {
        // Fire particles
        if (Math.random() < 0.1) {
            const flame = this.add.circle(
                this.ball.x + Phaser.Math.Between(-30, 30),
                this.ball.y + Phaser.Math.Between(-30, 30),
                Phaser.Math.Between(4, 10), 0xff4500
            );
            this.tweens.add({
                targets: flame,
                y: flame.y - 40,
                alpha: 0,
                duration: 500,
                onComplete: () => flame.destroy()
            });
        }
    }

    updateBallTrail() {
        // Add current ball position to trail
        this.trailPoints.push({
            x: this.ball.x,
            y: this.ball.y,
            time: this.time.now
        });

        // Remove old trail points (older than 1 second)
        this.trailPoints = this.trailPoints.filter(point => 
            this.time.now - point.time < this.trailLifetime
        );

        // Limit trail points to prevent memory issues
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }

        // Draw the trail line with ball's color
        this.trailGraphics.clear();
        if (this.trailPoints.length > 1) {
            this.trailGraphics.lineStyle(8, this.ballData.color, 0.8);
            this.trailGraphics.beginPath();
            this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            
            for (let i = 1; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const age = this.time.now - point.time;
                const alpha = 1 - (age / this.trailLifetime);
                
                this.trailGraphics.lineTo(point.x, point.y);
            }
            
            this.trailGraphics.strokePath();
        }
    }

    handleClick(x, y, tutorialText) {
        // Calculate distance from click to ball center
        const distance = Phaser.Math.Distance.Between(x, y, this.ball.x, this.ball.y);
        
        // Check if big target power-up is active
        const effectiveRadius = this.activePowerUps.bigTarget.active ? this.targetRadius * 1.5 : this.targetRadius;
        
        // Only allow ball interaction if click is within the target radius
        if (distance <= effectiveRadius) {
            if (tutorialText.active) {
                tutorialText.setVisible(false);
            }

            const randomXVelocity = Phaser.Math.Between(-800, 800);
            this.ball.setVelocityX(randomXVelocity);
            this.ball.setVelocityY(-this.ballData.jumpPower * 2);

            // Calculate score with power-up multiplier
            const baseScore = 1;
            const scoreToAdd = this.activePowerUps.doublePoints.active ? baseScore * 2 : baseScore;
            this.score += scoreToAdd;
            this.scoreText.setText('Score: ' + this.score);

            // Add currency (money earned per hit)
            const moneyMultiplier = this.activePowerUps.doublePoints.active ? 2 : 1;
            gameDataManager.addHit(moneyMultiplier);

            // Removed screen shake effect
        }
    }

    spawnPowerUp() {
        const powerUpTypes = ['slowMotion', 'bigTarget', 'doublePoints', 'freezeShrink'];
        const randomType = Phaser.Utils.Array.GetRandom(powerUpTypes);
        
        const x = Phaser.Math.Between(200, 1848);
        const y = Phaser.Math.Between(200, 600);
        
        // Create power-up visual - stationary, no physics
        const powerUp = this.add.image(x, y, 'ball');
        powerUp.setScale(0.8); // Double the scale for the new resolution
        powerUp.setData('type', randomType);
        
        // Add a pulsing effect to make it more visible
        this.tweens.add({
            targets: powerUp,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Color code power-ups
        switch (randomType) {
            case 'slowMotion':
                powerUp.setTint(0x0000ff); // Blue
                break;
            case 'bigTarget':
                powerUp.setTint(0x00ff00); // Green
                break;
            case 'doublePoints':
                powerUp.setTint(0xffff00); // Yellow
                break;
            case 'freezeShrink':
                powerUp.setTint(0xff00ff); // Magenta
                break;
        }
        
        // Add to a simple array instead of physics group
        this.powerUps.push(powerUp);
        
        // Remove power-up after 5 seconds
        this.time.delayedCall(5000, () => {
            if (powerUp.active) {
                const index = this.powerUps.indexOf(powerUp);
                if (index > -1) {
                    this.powerUps.splice(index, 1);
                }
                powerUp.destroy();
            }
        });
    }

    collectPowerUp(ball, powerUp) {
        // This method now needs to be called manually since we're not using physics overlap
        // We'll check for collisions in the update method instead
    }

    activatePowerUp(type) {
        // Activate power-up
        switch (type) {
            case 'slowMotion':
                this.activePowerUps.slowMotion.active = true;
                this.activePowerUps.slowMotion.timer = 5000; // 5 seconds
                this.physics.world.timeScale = 0.5;
                break;
            case 'bigTarget':
                this.activePowerUps.bigTarget.active = true;
                this.activePowerUps.bigTarget.timer = 8000; // 8 seconds
                break;
            case 'doublePoints':
                this.activePowerUps.doublePoints.active = true;
                this.activePowerUps.doublePoints.timer = 10000; // 10 seconds
                break;
            case 'freezeShrink':
                this.activePowerUps.freezeShrink.active = true;
                this.activePowerUps.freezeShrink.timer = 15000; // 15 seconds
                break;
        }
    }

    updatePowerUps() {
        let statusText = '';
        
        Object.keys(this.activePowerUps).forEach(key => {
            const powerUp = this.activePowerUps[key];
            if (powerUp.active) {
                powerUp.timer -= this.game.loop.delta;
                
                if (powerUp.timer <= 0) {
                    powerUp.active = false;
                    
                    // Deactivate power-up effects
                    switch (key) {
                        case 'slowMotion':
                            this.physics.world.timeScale = 1;
                            break;
                    }
                } else {
                    // Add to status display
                    const timeLeft = Math.ceil(powerUp.timer / 1000);
                    const displayName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                    statusText += `${displayName}: ${timeLeft}s\n`;
                }
            }
        });
        
        this.powerUpText.setText(statusText);
    }

    shrinkTarget() {
        // Don't shrink if freeze shrink power-up is active
        if (this.activePowerUps.freezeShrink.active) {
            this.timeUntilShrink = 10;
            return;
        }
        
        // Reduce the target radius
        this.targetRadius = Math.max(this.minTargetRadius, this.targetRadius - this.shrinkAmount);
        
        // Update the difficulty text
        this.difficultyText.setText('Target Size: ' + this.targetRadius);
        
        // Reset countdown
        this.timeUntilShrink = 10;
    }

    updateCountdown() {
        this.timeUntilShrink -= 1;
        if (this.timeUntilShrink <= 0) {
            this.timeUntilShrink = 10;
        }
        
        // Show different message if freeze shrink is active
        if (this.activePowerUps.freezeShrink.active) {
            this.countdownText.setText('Shrinking FROZEN!');
        } else {
            this.countdownText.setText('Next shrink in: ' + this.timeUntilShrink + 's');
        }
    }

    GameOver() {
        // Update best score
        gameDataManager.updateBestScore(this.score);
        
        // Start the GameOver scene instead of restarting
        this.scene.start('GameOver', { score: this.score });
    }
}
