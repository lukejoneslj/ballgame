import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { HighScores } from './scenes/HighScores.js';
import { Preloader } from './scenes/Preloader.js';
import { Shop } from './scenes/Shop.js';
import { Start } from './scenes/Start.js';
import { UsernameInput } from './scenes/UsernameInput.js';

const config = {
    type: Phaser.AUTO,
    width: 2048,
    height: 1536,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 1000 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        UsernameInput,
        Start,
        Game,
        GameOver,
        Shop,
        HighScores
    ]
};

new Phaser.Game(config);
