import { COLORS, GAME_CONFIG } from '../config/constants.js';

export class Starfield {
  constructor(scene, width, height, starCount = GAME_CONFIG.STAR_COUNT) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.starCount = starCount;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(-100);
    this.stars = [];

    this.initializeStars();
  }

  initializeStars() {
    for (let i = 0; i < this.starCount; i++) {
      const x = Phaser.Math.Between(0, this.width);
      const y = Phaser.Math.Between(0, this.height);
      const color = Phaser.Utils.Array.GetRandom(COLORS.STAR_COLORS);
      const size = Phaser.Math.FloatBetween(1, 2.5);
      const twinkleSpeed = Phaser.Math.FloatBetween(0.001, 0.004);
      const twinklePhase = Phaser.Math.FloatBetween(0, Math.PI * 2);

      this.stars.push({
        x,
        y,
        color,
        size,
        twinkleSpeed,
        twinklePhase,
        alpha: 1,
      });
    }
  }

  update() {
    this.graphics.clear();

    for (let star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
      star.alpha = 0.5 + 0.5 * Math.sin(star.twinklePhase);

      this.graphics.fillStyle(star.color, star.alpha);
      this.graphics.fillCircle(star.x, star.y, star.size);
    }
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
    this.stars = [];
  }
}
