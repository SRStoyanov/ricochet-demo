import { BRICK_TYPES, GAME_CONFIG } from '../config/constants.js';

export class Brick {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = BRICK_TYPES[type.toUpperCase()];

    if (!this.config) {
      throw new Error(`Invalid brick type: ${type}`);
    }

    this.hits = this.config.hits;
    this.maxHits = this.config.hits;
    this.spawns_powerup = this.config.spawns_powerup;
    this.explodes = this.config.explodes || false;

    this.createSprite();
  }

  createSprite() {
    this.sprite = this.scene.add.sprite(this.x, this.y, this.config.sprite);
    this.sprite.displayWidth = GAME_CONFIG.BRICK_WIDTH;
    this.sprite.displayHeight = GAME_CONFIG.BRICK_HEIGHT;

    // Store reference to this brick instance in the sprite
    this.sprite.brickInstance = this;

    // Set data for compatibility with existing collision system
    this.sprite.setData('hits', this.hits);
    this.sprite.setData('type', this.type);
    this.sprite.setData('brickInstance', this);
  }

  hit() {
    this.hits--;
    this.sprite.setData('hits', this.hits);

    // Handle visual changes for damaged bricks
    if (this.hits > 0 && this.config.damaged_sprite) {
      this.sprite.setTexture(this.config.damaged_sprite);
    }

    return this.hits <= 0; // Returns true if brick should be destroyed
  }

  shouldSpawnPowerup() {
    return this.spawns_powerup;
  }

  shouldExplode() {
    return this.explodes;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

  // Static method to create bricks in a grid pattern
  static createBrickGrid(scene, bricksGroup) {
    const bricks = [];
    const totalBricksWidth = GAME_CONFIG.BRICK_COLS * GAME_CONFIG.BRICK_WIDTH +
                           (GAME_CONFIG.BRICK_COLS - 1) * 4;
    const bricksStartX = (scene.game.config.width - totalBricksWidth) / 2 +
                        GAME_CONFIG.BRICK_WIDTH / 2;

    // Create and randomize brick positions
    let brickPositions = [];
    for (let row = 0; row < GAME_CONFIG.BRICK_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.BRICK_COLS; col++) {
        let x = bricksStartX + col * (GAME_CONFIG.BRICK_WIDTH + 4);
        let y = 60 + row * (GAME_CONFIG.BRICK_HEIGHT + 4);
        brickPositions.push({ x, y, row, col });
      }
    }

    // Shuffle positions for variety
    Phaser.Utils.Array.Shuffle(brickPositions);

    // Place a few orange bricks randomly
    let orangeBrickCount = 4;
    let orangeIndices = Phaser.Utils.Array.Shuffle([
      ...Array(GAME_CONFIG.BRICK_ROWS * GAME_CONFIG.BRICK_COLS).keys(),
    ]).slice(0, orangeBrickCount);

    let i = 0;
    for (let row = 0; row < GAME_CONFIG.BRICK_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.BRICK_COLS; col++) {
        let { x, y } = brickPositions[i];
        let brickType;

        if (orangeIndices.includes(i)) {
          brickType = 'orange';
        } else if (row === 0) {
          brickType = 'blue';
        } else if (row < 3) {
          brickType = 'red';
        } else {
          brickType = 'green';
        }

        const brick = new Brick(scene, x, y, brickType);
        brick.sprite.setData('row', row);
        brick.sprite.setData('col', col);

        bricksGroup.add(brick.sprite);
        bricks.push(brick);
        i++;
      }
    }

    return bricks;
  }
}
