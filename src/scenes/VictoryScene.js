import { SCENES } from '../config/constants.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.VICTORY);
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#111');

    // Victory title
    this.add
      .text(this.game.config.width / 2, 200, 'Victory!', {
        fontSize: '48px',
        fill: '#44ff44',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(this.game.config.width / 2, 260, 'Congratulations! You destroyed all the bricks!', {
        fontSize: '24px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    // Play Again button
    const playAgainBtn = this.add
      .text(this.game.config.width / 2, 350, 'Play Again', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#333388',
        padding: { left: 25, right: 25, top: 10, bottom: 10 },
        borderRadius: 8,
      })
      .setOrigin(0.5)
      .setInteractive();

    playAgainBtn.on('pointerdown', () => {
      this.scene.start(SCENES.MAIN);
    });

    // Main menu button
    const menuBtn = this.add
      .text(this.game.config.width / 2, 420, 'Main Menu', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#444444',
        padding: { left: 25, right: 25, top: 10, bottom: 10 },
        borderRadius: 8,
      })
      .setOrigin(0.5)
      .setInteractive();

    menuBtn.on('pointerdown', () => {
      this.scene.start(SCENES.TITLE);
    });

    // Add hover effects
    playAgainBtn.on('pointerover', () => {
      playAgainBtn.setStyle({ backgroundColor: '#4444aa' });
    });

    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setStyle({ backgroundColor: '#333388' });
    });

    menuBtn.on('pointerover', () => {
      menuBtn.setStyle({ backgroundColor: '#666666' });
    });

    menuBtn.on('pointerout', () => {
      menuBtn.setStyle({ backgroundColor: '#444444' });
    });

    // Auto-restart hint
    this.add
      .text(this.game.config.width / 2, 500, 'Press SPACE to play again', {
        fontSize: '18px',
        fill: '#aaaaaa',
      })
      .setOrigin(0.5);

    // Keyboard controls
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start(SCENES.MAIN);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start(SCENES.TITLE);
    });

    // Victory celebration effect
    this.createCelebrationEffect();
  }

  createCelebrationEffect() {
    // Create some sparkle effects
    const sparkles = [];
    const sparkleCount = 20;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = this.add.circle(
        Phaser.Math.Between(100, this.game.config.width - 100),
        Phaser.Math.Between(100, this.game.config.height - 100),
        3,
        0xffffff,
        0.8
      );

      sparkles.push(sparkle);

      // Animate sparkles
      this.tweens.add({
        targets: sparkle,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 1000,
        delay: i * 50,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}
