# 🔥 Firebase Setup Guide

## Quick 5-Minute Setup for Global High Scores

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "ball-game-scores")
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Set Up Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select location (choose closest to your users)
5. Click "Done"

### 3. Get Your Database URL
1. In Realtime Database, look for the URL at the top
2. It looks like: `https://your-project-default-rtdb.firebaseio.com/`
3. Copy this URL

### 4. Configure Your Game
1. Open `src/services/FirebaseService.js`
2. Find this line:
   ```javascript
   databaseURL: "https://your-project-default-rtdb.firebaseio.com/"
   ```
3. Replace with your actual database URL

### 5. Set Database Rules (Optional - For Security)
1. Go to "Realtime Database" → "Rules" tab
2. Replace the rules with:
   ```json
   {
     "rules": {
       "users": {
         "$user_id": {
           ".read": "$user_id === auth.uid",
           ".write": "$user_id === auth.uid"
         }
       },
       "highScores": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

### 6. Test Your Setup
1. Run your game locally
2. Create a username and play
3. Check Firebase Console → Realtime Database
4. You should see your data appearing in real-time!

## 🚀 Benefits You Just Gained:
- **Global High Scores** - Players compete worldwide
- **Cross-Device Saves** - Play on phone, continue on computer
- **Real-time Updates** - See new high scores instantly
- **No Server Needed** - Everything runs from your frontend
- **Free Tier** - Firebase is free for small games

## 📊 What the Data Looks Like:
```json
{
  "users": {
    "PlayerName": {
      "dollars": 150,
      "currentBall": "bounce",
      "bestScore": 1250,
      "unlockedBalls": ["classic", "bounce"]
    }
  },
  "highScores": {
    "PlayerName": {
      "username": "PlayerName",
      "score": 1250,
      "date": 1640995200000
    }
  }
}
```

## 🛡️ Fallback System:
- If Firebase fails, the game automatically uses localStorage
- Your players will never lose progress
- You can deploy without Firebase and add it later

## 🔧 Advanced Tips:
1. **Monitor Usage**: Firebase Console shows real-time usage stats
2. **Backup Data**: You can export your database anytime
3. **Add Authentication**: For more security, add Firebase Auth later
4. **Analytics**: Track user behavior with Firebase Analytics

**That's it!** Your ball game now has global high scores that sync across all devices. Deploy anywhere and it just works! 🎮✨ 