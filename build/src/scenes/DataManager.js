import { firebaseService } from '../services/FirebaseService.js';

export class DataManager {
    constructor() {
        this.currentUsername = null;
        this.gameData = {
            dollars: 0,
            totalHits: 0,
            currentBall: 'classic',
            unlockedBalls: ['classic'],
            bestScore: 0
        };
        
        this.ballTypes = {
            classic: {
                name: 'Classic Ball',
                cost: 0,
                color: 0xffffff,
                scale: 0.5,
                bounce: 0.9,
                jumpPower: 800,
                description: 'The original ball',
                unlocked: true
            },
            heavy: {
                name: 'Heavy Ball',
                cost: 50,
                color: 0x808080,
                scale: 0.6,
                bounce: 0.7,
                jumpPower: 600,
                description: 'Falls faster, harder to control',
                unlocked: false
            },
            bouncy: {
                name: 'Super Bouncy',
                cost: 75,
                color: 0x00ff00,
                scale: 0.4,
                bounce: 1.2,
                jumpPower: 900,
                description: 'Extra bouncy with more jump power',
                unlocked: false
            },
            light: {
                name: 'Feather Ball',
                cost: 100,
                color: 0xffff00,
                scale: 0.3,
                bounce: 0.95,
                jumpPower: 1000,
                description: 'Lightweight with high jump',
                unlocked: false
            },
            magnetic: {
                name: 'Magnetic Ball',
                cost: 150,
                color: 0xff00ff,
                scale: 0.5,
                bounce: 0.9,
                jumpPower: 800,
                description: 'Attracts power-ups automatically',
                unlocked: false,
                special: 'magnetism'
            },
            golden: {
                name: 'Golden Ball',
                cost: 200,
                color: 0xffd700,
                scale: 0.5,
                bounce: 0.9,
                jumpPower: 800,
                description: 'Earns 2x money per hit',
                unlocked: false,
                special: 'doubleMoney'
            },
            ice: {
                name: 'Ice Ball',
                cost: 125,
                color: 0x87ceeb,
                scale: 0.45,
                bounce: 1.1,
                jumpPower: 850,
                description: 'Slippery and unpredictable',
                unlocked: false,
                special: 'slippery'
            },
            fire: {
                name: 'Fire Ball',
                cost: 175,
                color: 0xff4500,
                scale: 0.5,
                bounce: 0.85,
                jumpPower: 900,
                description: 'Burns through obstacles',
                unlocked: false,
                special: 'burning'
            },
            electric: {
                name: 'Electric Ball',
                cost: 225,
                color: 0x00ffff,
                scale: 0.45,
                bounce: 0.95,
                jumpPower: 850,
                description: 'Sparks with energy',
                unlocked: false,
                special: 'electric'
            },
            giant: {
                name: 'Giant Ball',
                cost: 275,
                color: 0x8b4513,
                scale: 0.8,
                bounce: 0.6,
                jumpPower: 500,
                description: 'Massive but slow',
                unlocked: false,
                special: 'giant'
            },
            tiny: {
                name: 'Tiny Ball',
                cost: 300,
                color: 0xff69b4,
                scale: 0.2,
                bounce: 1.5,
                jumpPower: 1200,
                description: 'Small but mighty',
                unlocked: false,
                special: 'tiny'
            },
            rainbow: {
                name: 'Rainbow Ball',
                cost: 350,
                color: 0xff00ff,
                scale: 0.5,
                bounce: 1.0,
                jumpPower: 800,
                description: 'Changes colors and effects',
                unlocked: false,
                special: 'rainbow'
            },
            ghost: {
                name: 'Ghost Ball',
                cost: 400,
                color: 0x9370db,
                scale: 0.5,
                bounce: 0.9,
                jumpPower: 800,
                description: 'Phases through walls occasionally',
                unlocked: false,
                special: 'ghost'
            },
            diamond: {
                name: 'Diamond Ball',
                cost: 500,
                color: 0xb9f2ff,
                scale: 0.4,
                bounce: 1.3,
                jumpPower: 950,
                description: 'Ultimate luxury ball',
                unlocked: false,
                special: 'diamond'
            }
        };
        
        // Initialize Firebase and load data
        this.initializeData();
    }
    
    // Initialize Firebase and load user data
    async initializeData() {
        try {
            // Initialize Firebase
            await firebaseService.init();
            console.log('Firebase initialized for global saves!');
        } catch (error) {
            console.log('Using offline mode with localStorage');
        }
        
        // Try to load last used username
        this.loadLastUsername();
        
        // Load user data if username exists
        if (this.currentUsername) {
            await this.loadUserData(this.currentUsername);
        }
    }
    
    // Username management
    async setUsername(username) {
        if (!username || username.trim() === '') return false;
        
        this.currentUsername = username.trim();
        localStorage.setItem('ballGameLastUsername', this.currentUsername);
        await this.loadUserData(this.currentUsername);
        return true;
    }
    
    loadLastUsername() {
        const lastUsername = localStorage.getItem('ballGameLastUsername');
        if (lastUsername) {
            this.currentUsername = lastUsername;
        }
    }
    
    getCurrentUsername() {
        return this.currentUsername;
    }
    
    // User data management
    async loadUserData(username) {
        try {
            const savedData = await firebaseService.loadUserData(username);
            if (savedData) {
                this.gameData = { ...this.gameData, ...savedData };
                
                // Update unlocked status in ballTypes
                this.gameData.unlockedBalls.forEach(ballId => {
                    if (this.ballTypes[ballId]) {
                        this.ballTypes[ballId].unlocked = true;
                    }
                });
            } else {
                // Reset to default for new user
                this.resetGameData();
            }
        } catch (error) {
            console.warn('Error loading user data:', error);
            this.resetGameData();
        }
    }
    
    async saveUserData() {
        if (this.currentUsername) {
            try {
                await firebaseService.saveUserData(this.currentUsername, this.gameData);
            } catch (error) {
                console.warn('Error saving user data:', error);
            }
        }
    }
    
    resetGameData() {
        this.gameData = {
            dollars: 0,
            totalHits: 0,
            currentBall: 'classic',
            unlockedBalls: ['classic'],
            bestScore: 0
        };
        
        // Reset ball unlock status
        Object.keys(this.ballTypes).forEach(ballId => {
            this.ballTypes[ballId].unlocked = ballId === 'classic';
        });
    }
    
    // High Score System
    async addToHighScores(score) {
        if (!this.currentUsername || score <= 0) return false;
        
        try {
            return await firebaseService.addHighScore(this.currentUsername, score);
        } catch (error) {
            console.warn('Error adding high score:', error);
            return false;
        }
    }
    
    async getHighScores() {
        try {
            return await firebaseService.getHighScores();
        } catch (error) {
            console.warn('Error getting high scores:', error);
            return [];
        }
    }
    
    async getPlayerRank(score) {
        try {
            const highScores = await this.getHighScores();
            const sortedScores = [...highScores].sort((a, b) => b.score - a.score);
            
            for (let i = 0; i < sortedScores.length; i++) {
                if (score >= sortedScores[i].score) {
                    return i + 1;
                }
            }
            
            return sortedScores.length + 1;
        } catch (error) {
            console.warn('Error getting player rank:', error);
            return 1;
        }
    }
    
    // Legacy support - update to use new save system
    async loadGameData() {
        // This method kept for backward compatibility
        if (this.currentUsername) {
            await this.loadUserData(this.currentUsername);
        }
    }
    
    async saveGameData() {
        // This method kept for backward compatibility
        await this.saveUserData();
    }
    
    async addHit(multiplier = 1) {
        this.gameData.totalHits++;
        
        // Check if current ball has double money special
        const currentBall = this.ballTypes[this.gameData.currentBall];
        const moneyMultiplier = currentBall.special === 'doubleMoney' ? 2 : 1;
        
        this.gameData.dollars += (1 * multiplier * moneyMultiplier);
        await this.saveUserData();
    }
    
    async updateBestScore(score) {
        if (score > this.gameData.bestScore) {
            this.gameData.bestScore = score;
            await this.saveUserData();
            
            // Add to global high scores
            await this.addToHighScores(score);
        }
    }
    
    canAfford(ballId) {
        const ball = this.ballTypes[ballId];
        return this.gameData.dollars >= ball.cost;
    }
    
    async buyBall(ballId) {
        const ball = this.ballTypes[ballId];
        if (this.canAfford(ballId) && !ball.unlocked) {
            this.gameData.dollars -= ball.cost;
            ball.unlocked = true;
            this.gameData.unlockedBalls.push(ballId);
            await this.saveUserData();
            return true;
        }
        return false;
    }
    
    async selectBall(ballId) {
        const ball = this.ballTypes[ballId];
        if (ball.unlocked) {
            this.gameData.currentBall = ballId;
            await this.saveUserData();
            return true;
        }
        return false;
    }
    
    getCurrentBall() {
        return this.ballTypes[this.gameData.currentBall];
    }
    
    getDollars() {
        return this.gameData.dollars;
    }
    
    getTotalHits() {
        return this.gameData.totalHits;
    }
    
    getBestScore() {
        return this.gameData.bestScore;
    }
    
    getAllBalls() {
        return this.ballTypes;
    }
    
    getUnlockedBalls() {
        return Object.keys(this.ballTypes).filter(ballId => this.ballTypes[ballId].unlocked);
    }
}

// Create global instance
export const gameDataManager = new DataManager(); 