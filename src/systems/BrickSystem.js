import { Brick } from '../entities/Brick.js';
import { GAME_CONFIG, COLORS } from '../config/constants.js';

export class BrickSystem {
  constructor(scene) {
    this.scene = scene;
    this.bricks = [];
    this.bricksGroup = null;
  }

  initialize() {
    // Create physics group for bricks
    this.bricksGroup = this.scene.physics.add.staticGroup();

    // Create the brick grid
    this.bricks = Brick.createBrickGrid(this.scene, this.bricksGroup);

    return this.bricksGroup;
  }

  handleBrickHit(ball, brickSprite) {
    const brick = brickSprite.brickInstance;

    if (!brick) {
      console.warn('Brick sprite has no associated brick instance');
      return;
    }

    const shouldDestroy = brick.hit();

    if (shouldDestroy) {
      this.destroyBrick(brick);
    }
  }

  destroyBrick(brick) {
    if (!brick.sprite || !brick.sprite.active) {
      return; // Already destroyed
    }

    // Remove from physics group
    this.bricksGroup.remove(brick.sprite);

    // Remove from our brick array
    const index = this.bricks.indexOf(brick);
    if (index > -1) {
      this.bricks.splice(index, 1);
    }

    // Handle special brick effects
    if (brick.shouldSpawnPowerup()) {
      this.scene.powerupSystem.spawnPowerup(brick.x, brick.y);
    }

    if (brick.shouldExplode()) {
      this.createExplosion(brick);
    }

    // Destroy the brick
    brick.destroy();
  }

  createExplosion(brick) {
    const explosionRadius = Math.max(GAME_CONFIG.BRICK_WIDTH, GAME_CONFIG.BRICK_HEIGHT) *
                           GAME_CONFIG.EXPLOSION_RADIUS_MULTIPLIER;
    const bx = brick.x;
    const by = brick.y;

    // Create visual explosion effect
    const explosion = this.scene.add.circle(bx, by, 10, COLORS.WHITE, 0.5);
    explosion.setDepth(10);

    // Animate explosion
    this.scene.tweens.add({
      targets: explosion,
      radius: explosionRadius,
      alpha: 0,
      duration: GAME_CONFIG.EXPLOSION_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => explosion.destroy(),
    });

    // Find and destroy bricks within explosion radius
    const bricksToDestroy = this.findBricksInRadius(bx, by, explosionRadius, brick);

    bricksToDestroy.forEach(targetBrick => {
      this.destroyBrick(targetBrick);
    });

    // Play explosion sound
    if (!this.scene.gameState.sfxMuted) {
      this.scene.sound.play('explosion');
    }
  }

  findBricksInRadius(centerX, centerY, radius, excludeBrick) {
    const bricksInRadius = [];

    this.bricks.forEach(brick => {
      if (brick === excludeBrick || !brick.sprite || !brick.sprite.active) {
        return;
      }

      const dx = brick.x - centerX;
      const dy = brick.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        bricksInRadius.push(brick);
      }
    });

    return bricksInRadius;
  }

  getRemainingBrickCount() {
    return this.bricks.filter(brick => brick.sprite && brick.sprite.active).length;
  }

  getAllBricks() {
    return this.bricks;
  }

  getActiveBricks() {
    return this.bricks.filter(brick => brick.sprite && brick.sprite.active);
  }

  getBricksGroup() {
    return this.bricksGroup;
  }

  // Check if all bricks are destroyed (victory condition)
  areAllBricksDestroyed() {
    return this.getRemainingBrickCount() === 0;
  }

  // Get brick at specific position (for debugging/testing)
  getBrickAt(x, y) {
    return this.bricks.find(brick => {
      if (!brick.sprite || !brick.sprite.active) return false;
      const bounds = brick.getBounds();
      return bounds.contains(x, y);
    });
  }

  // Clear all bricks (for scene cleanup)
  clearAll() {
    this.bricks.forEach(brick => {
      if (brick.sprite) {
        brick.destroy();
      }
    });
    this.bricks = [];

    if (this.bricksGroup) {
      this.bricksGroup.clear(true, true);
    }
  }

  // Get statistics about remaining bricks
  getBrickStats() {
    const stats = {
      total: this.bricks.length,
      active: 0,
      byType: {}
    };

    this.bricks.forEach(brick => {
      if (brick.sprite && brick.sprite.active) {
        stats.active++;
        stats.byType[brick.type] = (stats.byType[brick.type] || 0) + 1;
      }
    });

    return stats;
  }
}
