import { Powerup } from '../entities/Powerup.js';
import { GAME_CONFIG } from '../config/constants.js';

export class PowerupSystem {
  constructor(scene) {
    this.scene = scene;
    this.activePowerups = [];
  }

  spawnPowerup(x, y, type = null) {
    const powerup = type ? new Powerup(this.scene, x, y, type) : Powerup.createRandom(this.scene, x, y);
    this.activePowerups.push(powerup);
    return powerup;
  }

  update(paddle, gameState) {
    // Update all powerups and remove destroyed ones
    this.activePowerups = this.activePowerups.filter(powerup => {
      const stillActive = powerup.update();

      if (!stillActive) {
        return false;
      }

      // Check collision with paddle
      if (this.checkPaddleCollision(paddle, powerup)) {
        this.collectPowerup(powerup, gameState);
        return false; // Remove from active list
      }

      return true;
    });
  }

  checkPaddleCollision(paddle, powerup) {
    return Phaser.Geom.Intersects.RectangleToRectangle(
      paddle.getBounds(),
      powerup.getBounds()
    );
  }

  collectPowerup(powerup, gameState) {
    // Apply the powerup effect
    powerup.applyEffect(gameState);

    // Play sound effect
    if (!gameState.sfxMuted) {
      this.scene.sound.play('powerUp');
    }

    // Destroy the powerup
    powerup.destroy();
  }

  clearAll() {
    this.activePowerups.forEach(powerup => powerup.destroy());
    this.activePowerups = [];
  }

  getActivePowerups() {
    return this.activePowerups;
  }

  getActivePowerupCount() {
    return this.activePowerups.length;
  }

  // Get powerups of a specific type
  getPowerupsByType(type) {
    return this.activePowerups.filter(powerup => powerup.type === type);
  }

  // Remove powerups that have fallen off screen
  cleanupOffscreenPowerups() {
    const screenHeight = this.scene.game.config.height;
    this.activePowerups = this.activePowerups.filter(powerup => {
      const pos = powerup.getPosition();
      if (pos.y > screenHeight + 50) {
        powerup.destroy();
        return false;
      }
      return true;
    });
  }
}
