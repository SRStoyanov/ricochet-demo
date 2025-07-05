import { POWERUP_TYPES, GAME_CONFIG, COLORS } from '../config/constants.js';

export class Powerup {
  constructor(scene, x, y, type = null) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // If no type specified, randomly choose one
    if (!type) {
      const types = Object.keys(POWERUP_TYPES);
      type = types[Math.floor(Math.random() * types.length)];
    }

    this.type = type;
    this.config = POWERUP_TYPES[type.toUpperCase()];

    if (!this.config) {
      throw new Error(`Invalid powerup type: ${type}`);
    }

    this.createSprite();
    this.setupPhysics();
  }

  createSprite() {
    // Create a circular powerup sprite
    this.sprite = this.scene.add.circle(
      this.x,
      this.y,
      GAME_CONFIG.POWERUP_RADIUS,
      this.config.color
    );

    // Store reference to this powerup instance
    this.sprite.powerupInstance = this;
    this.sprite.setData('type', this.type);
    this.sprite.setData('powerupInstance', this);
  }

  setupPhysics() {
    // Add physics body
    this.scene.physics.add.existing(this.sprite);
    this.sprite.body.setVelocity(0, GAME_CONFIG.POWERUP_FALL_SPEED);
    this.sprite.body.setImmovable(false);
    this.sprite.body.setAllowGravity(false);
  }

  update() {
    // Remove powerup if it falls off screen
    if (this.sprite.y > this.scene.game.config.height + 50) {
      this.destroy();
      return false; // Signal that this powerup should be removed from arrays
    }
    return true; // Powerup is still active
  }

  applyEffect(gameState) {
    switch (this.config.effect) {
      case 'speed_increase':
        gameState.ballSpeed = Math.min(
          gameState.ballSpeed + GAME_CONFIG.SPEED_INCREASE,
          GAME_CONFIG.MAX_BALL_SPEED
        );
        break;

      case 'speed_decrease':
        gameState.ballSpeed = Math.max(
          gameState.ballSpeed - GAME_CONFIG.SPEED_DECREASE,
          GAME_CONFIG.MIN_BALL_SPEED
        );
        break;

      default:
        console.warn(`Unknown powerup effect: ${this.config.effect}`);
    }
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  // Static method to create a random powerup
  static createRandom(scene, x, y) {
    const types = Object.keys(POWERUP_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Powerup(scene, x, y, randomType.toLowerCase());
  }

  // Static method to create a specific powerup type
  static createSpeedUp(scene, x, y) {
    return new Powerup(scene, x, y, 'speedup');
  }

  static createSlowDown(scene, x, y) {
    return new Powerup(scene, x, y, 'slowdown');
  }
}
