// Simple Firebase Realtime Database service
class FirebaseService {
    constructor() {
        this.db = null;
        this.isConnected = false;
        this.offlineMode = false;
    }

    // Initialize Firebase - you'll need to add your config
    async init() {
        try {
            // Replace with your Firebase config from the console
            const firebaseConfig = {
                // Add your config here
                databaseURL: "https://your-project-default-rtdb.firebaseio.com/"
            };

            // Initialize Firebase
            if (!window.firebase?.apps?.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.db = firebase.database();
            this.isConnected = true;
            
            // Test connection
            await this.db.ref('.info/connected').once('value');
            console.log('Firebase connected successfully');
            
        } catch (error) {
            console.warn('Firebase initialization failed, using offline mode:', error);
            this.offlineMode = true;
            this.isConnected = false;
        }
    }

    // Save user data
    async saveUserData(username, gameData) {
        if (!this.isConnected) {
            // Fallback to localStorage
            localStorage.setItem(`ballGameData_${username}`, JSON.stringify(gameData));
            return;
        }

        try {
            await this.db.ref(`users/${this.sanitizeUsername(username)}`).set({
                ...gameData,
                lastUpdated: Date.now()
            });
        } catch (error) {
            console.warn('Firebase save failed, using localStorage:', error);
            localStorage.setItem(`ballGameData_${username}`, JSON.stringify(gameData));
        }
    }

    // Load user data
    async loadUserData(username) {
        if (!this.isConnected) {
            // Fallback to localStorage
            const saved = localStorage.getItem(`ballGameData_${username}`);
            return saved ? JSON.parse(saved) : null;
        }

        try {
            const snapshot = await this.db.ref(`users/${this.sanitizeUsername(username)}`).once('value');
            const data = snapshot.val();
            
            if (data) {
                // Remove Firebase metadata
                const { lastUpdated, ...gameData } = data;
                return gameData;
            }
            return null;
        } catch (error) {
            console.warn('Firebase load failed, using localStorage:', error);
            const saved = localStorage.getItem(`ballGameData_${username}`);
            return saved ? JSON.parse(saved) : null;
        }
    }

    // Add/update high score
    async addHighScore(username, score) {
        if (!this.isConnected) {
            // Fallback to localStorage
            return this.addHighScoreLocal(username, score);
        }

        try {
            const scoresRef = this.db.ref('highScores');
            const userScoreRef = scoresRef.child(this.sanitizeUsername(username));
            
            // Get current score
            const snapshot = await userScoreRef.once('value');
            const currentData = snapshot.val();
            
            // Only update if new score is better
            if (!currentData || score > currentData.score) {
                await userScoreRef.set({
                    username: username,
                    score: score,
                    date: Date.now()
                });
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Firebase high score save failed, using localStorage:', error);
            return this.addHighScoreLocal(username, score);
        }
    }

    // Get high scores
    async getHighScores() {
        if (!this.isConnected) {
            // Fallback to localStorage
            return this.getHighScoresLocal();
        }

        try {
            const snapshot = await this.db.ref('highScores').orderByChild('score').limitToLast(10).once('value');
            const data = snapshot.val();
            
            if (!data) return [];
            
            // Convert to array and sort by score (descending)
            const scores = Object.values(data).sort((a, b) => b.score - a.score);
            return scores;
        } catch (error) {
            console.warn('Firebase high scores load failed, using localStorage:', error);
            return this.getHighScoresLocal();
        }
    }

    // Fallback localStorage methods
    addHighScoreLocal(username, score) {
        const highScores = this.getHighScoresLocal();
        const existingEntry = highScores.find(entry => entry.username === username);
        
        if (existingEntry) {
            if (score > existingEntry.score) {
                existingEntry.score = score;
                existingEntry.date = Date.now();
                this.saveHighScoresLocal(highScores);
                return true;
            }
        } else {
            highScores.push({
                username: username,
                score: score,
                date: Date.now()
            });
            this.saveHighScoresLocal(highScores);
            return true;
        }
        return false;
    }

    getHighScoresLocal() {
        const saved = localStorage.getItem('ballGameHighScores');
        return saved ? JSON.parse(saved) : [];
    }

    saveHighScoresLocal(scores) {
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 10);
        localStorage.setItem('ballGameHighScores', JSON.stringify(topScores));
    }

    // Utility function to sanitize usernames for Firebase keys
    sanitizeUsername(username) {
        return username.replace(/[.#$[\]]/g, '_');
    }

    // Check if online
    isOnline() {
        return this.isConnected && !this.offlineMode;
    }
}

// Create global instance
const firebaseService = new FirebaseService();

// Export for use in other modules
export { firebaseService }; 