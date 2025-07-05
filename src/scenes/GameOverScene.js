import { SCENES } from '../config/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME_OVER);
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#111');

    // Game Over title
    this.add
      .text(this.game.config.width / 2, 200, 'Game Over', {
        fontSize: '48px',
        fill: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(this.game.config.width / 2, 260, 'Better luck next time!', {
        fontSize: '24px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    // Restart button
    const restartBtn = this.add
      .text(this.game.config.width / 2, 350, 'Restart', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#333388',
        padding: { left: 25, right: 25, top: 10, bottom: 10 },
        borderRadius: 8,
      })
      .setOrigin(0.5)
      .setInteractive();

    restartBtn.on('pointerdown', () => {
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
    restartBtn.on('pointerover', () => {
      restartBtn.setStyle({ backgroundColor: '#4444aa' });
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setStyle({ backgroundColor: '#333388' });
    });

    menuBtn.on('pointerover', () => {
      menuBtn.setStyle({ backgroundColor: '#666666' });
    });

    menuBtn.on('pointerout', () => {
      menuBtn.setStyle({ backgroundColor: '#444444' });
    });

    // Auto-restart hint
    this.add
      .text(this.game.config.width / 2, 500, 'Press SPACE to restart', {
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
  }
}
