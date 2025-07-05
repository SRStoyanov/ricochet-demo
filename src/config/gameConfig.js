import { GAME_CONFIG, COLORS } from './constants.js';

// Phaser game configuration
export const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: COLORS.BACKGROUND,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [] // Scenes will be added dynamically
};

// Physics world bounds settings
export const WORLD_BOUNDS = {
  left: true,
  right: true,
  top: true,
  bottom: false // Allow ball to fall through bottom
};

// Game state
export const GameState = {
  lives: GAME_CONFIG.MAX_LIVES,
  ballSpeed: GAME_CONFIG.START_BALL_SPEED,
  ballLaunched: false,
  sfxMuted: false,
  ballRotationDir: 1,
  powerups: []
};

// Reset game state to initial values
export function resetGameState() {
  GameState.lives = GAME_CONFIG.MAX_LIVES;
  GameState.ballSpeed = GAME_CONFIG.START_BALL_SPEED;
  GameState.ballLaunched = false;
  GameState.sfxMuted = false;
  GameState.ballRotationDir = 1;
  GameState.powerups = [];
}
