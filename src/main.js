import { config } from './config/gameConfig.js';
import { TitleScene } from './scenes/TitleScene.js';
import { MainScene } from './scenes/MainScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

// Add all scenes to the game configuration
config.scene = [
  TitleScene,
  MainScene,
  GameOverScene,
  VictoryScene
];

// Initialize the Phaser game
const game = new Phaser.Game(config);

// Export game instance for debugging/testing
window.game = game;

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Game Error:', event.error);
});

// Add visibility change handling to pause/resume game
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.pause();
  } else {
    game.scene.resume();
  }
});

// Development helpers (remove in production)
if (process.env.NODE_ENV === 'development') {
  // Add debugging helpers
  window.debugGame = {
    getActiveScene: () => game.scene.getScenes(true)[0],
    togglePhysicsDebug: () => {
      const scene = game.scene.getScenes(true)[0];
      if (scene.physics && scene.physics.world) {
        scene.physics.world.debugGraphic.visible = !scene.physics.world.debugGraphic.visible;
      }
    },
    getBrickCount: () => {
      const scene = game.scene.getScenes(true)[0];
      return scene.brickSystem ? scene.brickSystem.getRemainingBrickCount() : 0;
    },
    getPowerupCount: () => {
      const scene = game.scene.getScenes(true)[0];
      return scene.powerupSystem ? scene.powerupSystem.getActivePowerupCount() : 0;
    }
  };
}
