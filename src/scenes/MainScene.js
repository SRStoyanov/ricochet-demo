import { GameState, resetGameState } from '../config/gameConfig.js';
import { GAME_CONFIG, COLORS, SCENES, AUDIO } from '../config/constants.js';
import { BrickSystem } from '../systems/BrickSystem.js';
import { PowerupSystem } from '../systems/PowerupSystem.js';

export class MainScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MAIN);
  }

  preload() {
    // Assets are loaded in TitleScene
  }

  create() {
    // Reset game state
    resetGameState();
    this.gameState = GameState;

    // Initialize systems
    this.brickSystem = new BrickSystem(this);
    this.powerupSystem = new PowerupSystem(this);

    // Store reference to powerup system in scene for brick system
    this.powerupSystem = this.powerupSystem;

    // Create game objects
    this.createPaddle();
    this.createBall();
    this.createBricks();
    this.createUI();
    this.setupInput();
    this.setupPhysics();
    this.setupWorldBounds();

    // Initialize UI
    this.updateUI();
  }

  createPaddle() {
    this.paddle = this.add.sprite(
      this.game.config.width / 2,
      this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT - 20,
      'paddle'
    );
    this.paddle.displayWidth = GAME_CONFIG.PADDLE_WIDTH;
    this.paddle.displayHeight = GAME_CONFIG.PADDLE_HEIGHT;
    this.physics.add.existing(this.paddle, true);
    this.paddleBody = this.paddle.body;
  }

  createBall() {
    this.ball = this.add.sprite(
      this.game.config.width / 2,
      this.game.config.height - 60,
      'ball'
    );
    this.ball.displayWidth = GAME_CONFIG.BALL_SIZE;
    this.ball.displayHeight = GAME_CONFIG.BALL_SIZE;
    this.physics.add.existing(this.ball);
    this.ball.body.setCollideWorldBounds(true, 1, 1);
    this.ball.body.setBounce(1, 1);
    this.resetBall();
  }

  createBricks() {
    this.bricksGroup = this.brickSystem.initialize();
  }

  createUI() {
    // UI bar background
    const uiBar = this.add.rectangle(
      this.game.config.width / 2,
      this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT / 2,
      this.game.config.width,
      GAME_CONFIG.UI_BAR_HEIGHT,
      COLORS.UI_BAR
    );
    uiBar.setOrigin(0.5);
    uiBar.setDepth(100);

    // UI text elements
    this.livesText = this.add.text(
      30,
      this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT + 15,
      'Lives: ' + this.gameState.lives,
      { fontSize: '24px', fill: '#fff' }
    );
    this.livesText.setDepth(101);

    this.speedText = this.add.text(
      200,
      this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT + 15,
      'Speed: ' + this.gameState.ballSpeed,
      { fontSize: '24px', fill: '#fff' }
    );
    this.speedText.setDepth(101);

    // SFX mute button
    this.sfxButton = this.add
      .text(400, this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT + 15, '🔊 SFX', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#444',
        padding: { left: 10, right: 10, top: 2, bottom: 2 },
        borderRadius: 5,
      })
      .setInteractive()
      .setDepth(101);

    this.sfxButton.on('pointerdown', () => {
      this.gameState.sfxMuted = !this.gameState.sfxMuted;
      this.sfxButton.setText(this.gameState.sfxMuted ? '🔇 SFX' : '🔊 SFX');
    });

    // Music mute button
    this.musicMuted = false;
    this.musicButton = this.add
      .text(520, this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT + 15, '🔊 Music', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#444',
        padding: { left: 10, right: 10, top: 2, bottom: 2 },
        borderRadius: 5,
      })
      .setInteractive()
      .setDepth(101);

    this.musicButton.on('pointerdown', () => {
      this.musicMuted = !this.musicMuted;
      if (this.bgm) this.bgm.setMute(this.musicMuted);
      this.musicButton.setText(this.musicMuted ? '🔇 Music' : '🔊 Music');
    });

    // Screen border
    const border = this.add.graphics();
    border.lineStyle(1, COLORS.BORDER, 1);
    border.strokeRect(0.5, 0.5, this.game.config.width - 1, this.game.config.height - 1);
    border.setDepth(1000);
  }

  setupInput() {
    // Mouse movement controls
    this.input.on('pointermove', (pointer) => {
      let newX = Phaser.Math.Clamp(
        pointer.x,
        GAME_CONFIG.PADDLE_WIDTH / 2,
        this.game.config.width - GAME_CONFIG.PADDLE_WIDTH / 2
      );
      this.paddle.x = newX;
      this.paddle.body.updateFromGameObject();

      // Keep ball glued to paddle if not launched
      if (!this.gameState.ballLaunched) {
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - GAME_CONFIG.PADDLE_HEIGHT / 2 - GAME_CONFIG.BALL_SIZE / 2;
      }
    });

    // Launch ball on click
    this.input.on('pointerdown', (pointer) => {
      // Don't launch if clicking in UI area
      if (pointer.y >= this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT) {
        return;
      }

      if (!this.gameState.ballLaunched && this.gameState.lives > 0) {
        this.launchBall();
      }
    });
  }

  setupPhysics() {
    // Ball-paddle collision
    this.physics.add.collider(
      this.ball,
      this.paddle,
      (ball, paddle) => {
        this.ballHitPaddle(ball, paddle);
        this.playRandomBounce();
      },
      null,
      this
    );

    // Ball-brick collision
    this.physics.add.collider(
      this.ball,
      this.bricksGroup,
      (ball, brick) => {
        this.brickSystem.handleBrickHit(ball, brick);
        this.playRandomBounce();
      },
      null,
      this
    );
  }

  setupWorldBounds() {
    // Set world bounds (no bottom collision)
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Handle world bounds collision sounds
    this.ball.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
      if (body.gameObject === this.ball && (up || left || right)) {
        this.playRandomBounce();
      }
    });
  }

  update() {
    // Maintain constant ball speed
    if (this.gameState.ballLaunched) {
      let velocity = new Phaser.Math.Vector2(this.ball.body.velocity.x, this.ball.body.velocity.y);
      velocity = velocity.normalize().scale(this.gameState.ballSpeed);
      this.ball.body.setVelocity(velocity.x, velocity.y);
    }

    // Check if ball fell below screen
    if (this.ball.y > this.game.config.height - GAME_CONFIG.UI_BAR_HEIGHT) {
      this.handleBallLoss();
    }

    // Update powerup system
    this.powerupSystem.update(this.paddle, this.gameState);

    // Update UI
    this.updateUI();

    // Check victory condition
    if (this.brickSystem.areAllBricksDestroyed()) {
      this.scene.start(SCENES.VICTORY);
    }
  }

  resetBall() {
    this.gameState.ballLaunched = false;
    this.ball.x = this.paddle.x;
    this.ball.y = this.paddle.y - GAME_CONFIG.PADDLE_HEIGHT / 2 - GAME_CONFIG.BALL_SIZE / 2;
    this.ball.body.setVelocity(0, 0);
    this.ball.body.updateFromGameObject();
  }

  launchBall() {
    this.gameState.ballLaunched = true;
    const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-30, 30));
    const speed = this.gameState.ballSpeed;
    this.ball.body.setVelocity(speed * Math.sin(angle), speed * Math.cos(angle));
  }

  ballHitPaddle(ball, paddle) {
    let diff = ball.x - paddle.x;
    let norm = diff / (GAME_CONFIG.PADDLE_WIDTH / 2);
    let angle = norm * GAME_CONFIG.PADDLE_ANGLE_RANGE;
    let rad = Phaser.Math.DegToRad(angle);
    let speed = this.gameState.ballSpeed;
    ball.body.setVelocity(speed * Math.sin(rad), -speed * Math.cos(rad));
  }

  handleBallLoss() {
    if (!this.gameState.sfxMuted) {
      this.sound.play('death');
    }

    this.gameState.lives--;

    if (this.gameState.lives > 0) {
      this.resetBall();
    } else {
      this.scene.start(SCENES.GAME_OVER);
    }
  }

  playRandomBounce() {
    if (this.gameState.sfxMuted) return;

    const bounceIndex = Phaser.Math.Between(1, AUDIO.SFX_BOUNCE_VARIANTS);
    this.sound.play('bounce-var' + bounceIndex);

    // Chance to reverse ball rotation
    if (Phaser.Math.FloatBetween(0, 1) < GAME_CONFIG.BALL_ROTATION_REVERSE_CHANCE) {
      this.gameState.ballRotationDir *= -1;
    }
  }

  updateUI() {
    this.livesText.setText('Lives: ' + this.gameState.lives);
    this.speedText.setText('Speed: ' + this.gameState.ballSpeed);
  }

  shutdown() {
    // Clean up systems
    if (this.brickSystem) {
      this.brickSystem.clearAll();
    }
    if (this.powerupSystem) {
      this.powerupSystem.clearAll();
    }
  }
}
