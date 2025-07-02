// Phaser Scenes
class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }
  preload() {
    preload.call(this);
  }
  create() {
    this.starfield = new Starfield(this, config.width, config.height, 80);
    // Play music if not already playing
    if (!this.sound.get("bgm")) {
      this.bgm = this.sound.add("bgm", { loop: true, volume: 0.5 });
      this.bgm.play();
    } else {
      this.bgm = this.sound.get("bgm");
      if (!this.bgm.isPlaying) this.bgm.play();
    }
    this.cameras.main.setBackgroundColor("#111");
    this.add
      .text(config.width / 2, 180, "Rogueochet Demo", {
        fontSize: "48px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const startBtn = this.add
      .text(config.width / 2, 320, "Start", {
        fontSize: "36px",
        fill: "#fff",
        backgroundColor: "#333388",
        padding: { left: 30, right: 30, top: 10, bottom: 10 },
        borderRadius: 10,
      })
      .setOrigin(0.5)
      .setInteractive();
    startBtn.on("pointerdown", () => {
      this.scene.start("MainScene");
    });
  }
  update() {
    if (this.starfield) this.starfield.update();
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }
  create() {
    this.cameras.main.setBackgroundColor("#a00");
    this.add
      .text(config.width / 2, 200, "Game Over!", {
        fontSize: "48px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const restartBtn = this.add
      .text(config.width / 2, 340, "Restart", {
        fontSize: "36px",
        fill: "#fff",
        backgroundColor: "#a00",
        padding: { left: 30, right: 30, top: 10, bottom: 10 },
        borderRadius: 10,
      })
      .setOrigin(0.5)
      .setInteractive();
    restartBtn.on("pointerdown", () => {
      lives = MAX_LIVES;
      this.scene.start("MainScene");
    });
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }
  preload() {
    /* no-op, already loaded in TitleScene */
  }
  create() {
    this.starfield = new Starfield(this, config.width, config.height, 80);
    this.cameras.main.setBackgroundColor("#111");
    create.call(this);
  }
  update() {
    if (this.starfield) this.starfield.update();
    update.call(this);
  }
  shutdown() {
    if (this.starfield) this.starfield.destroy();
  }
}

// Phaser game configuration object (move this below scene classes)
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [TitleScene, MainScene, GameOverScene],
};

// Create the Phaser game instance (move this below config)
const game = new Phaser.Game(config);

// Preload assets (none needed for this game)
function preload() {
  // Load sound effects
  for (let i = 1; i <= 5; i++) {
    this.load.audio("bounce-var" + i, "assets/sounds/bounce-var" + i + ".wav");
  }
  this.load.audio("death", "assets/sounds/death.wav");
  this.load.audio("explosion", "assets/sounds/explosion.wav");
  this.load.audio("powerUp", "assets/sounds/powerUp.wav");
  // Load background music (mp3 is supported by Phaser)
  this.load.audio("bgm", "assets/music/GalacticRap.mp3");
  this.load.image("paddle", "assets/graphics/sprites/paddle.png");
  this.load.image("ball", "assets/graphics/sprites/ball.png");
  this.load.image("brick_blue", "assets/graphics/sprites/brick-blue.png");
  this.load.image("brick_green", "assets/graphics/sprites/brick-green.png");
  this.load.image("brick_orange", "assets/graphics/sprites/brick-orange.png");
  this.load.image(
    "brick_red_whole",
    "assets/graphics/sprites/brick-red-whole.png"
  );
  this.load.image(
    "brick_red_damaged",
    "assets/graphics/sprites/brick-red-damaged.png"
  );
}

// Game constants
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 20;
const BALL_SIZE = 16;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 64;
const BRICK_HEIGHT = 32;
const START_BALL_SPEED = 200;
const POWERUP_SPEED = 60;
const MAX_LIVES = 3;
const ORANGE = 0xffa500; // Orange color for new brick type
const UI_BAR_HEIGHT = 60; // Height of the UI bar at the bottom

// Game variables
let paddle, // The player's paddle
  paddleBody, // Physics body for the paddle
  ball, // The ball
  bricks, // Group of all bricks
  gameOverText, // Game over UI text
  livesText, // UI text for lives
  speedText, // UI text for ball speed
  powerups = []; // Array of active powerups
let ballLaunched = false; // Is the ball in motion?
let lives = MAX_LIVES; // Player's remaining lives
let ballSpeed = START_BALL_SPEED; // Current ball speed
let sfxMuted = false; // SFX mute state
let ballRotationDir = 1; // 1 for clockwise, -1 for counterclockwise

// Starfield class for twinkling background
class Starfield {
  constructor(scene, width, height, starCount = 80) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.starCount = starCount;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(-100);
    this.stars = [];
    const STAR_COLORS = [0xffffff, 0xffff66];
    for (let i = 0; i < starCount; i++) {
      let x = Phaser.Math.Between(0, width);
      let y = Phaser.Math.Between(0, height);
      let color = Phaser.Utils.Array.GetRandom(STAR_COLORS);
      let size = Phaser.Math.FloatBetween(1, 2.5);
      let twinkleSpeed = Phaser.Math.FloatBetween(0.001, 0.004);
      let twinklePhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
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
    this.graphics.destroy();
    this.stars = [];
  }
}

// Create game objects and set up the scene
function create() {
  // Create the player's paddle as a sprite
  paddle = this.add.sprite(
    config.width / 2,
    config.height - UI_BAR_HEIGHT - 20,
    "paddle"
  );
  paddle.displayWidth = PADDLE_WIDTH;
  paddle.displayHeight = PADDLE_HEIGHT;
  this.physics.add.existing(paddle, true); // Add static physics body
  paddleBody = paddle.body;

  // Create the ball as a sprite
  ball = this.add.sprite(config.width / 2, config.height - 60, "ball");
  ball.displayWidth = BALL_SIZE;
  ball.displayHeight = BALL_SIZE;
  this.physics.add.existing(ball);
  ball.body.setCollideWorldBounds(true, 1, 1);
  ball.body.setBounce(1, 1);
  resetBall.call(this); // Start with ball glued to paddle

  // Center bricks horizontally
  const totalBricksWidth = BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * 4;
  const bricksStartX = (config.width - totalBricksWidth) / 2 + BRICK_WIDTH / 2;
  // Create and randomize brick positions
  bricks = this.physics.add.staticGroup(); // Bricks are static
  let brickPositions = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      let x = bricksStartX + col * (BRICK_WIDTH + 4);
      let y = 60 + row * (BRICK_HEIGHT + 4);
      brickPositions.push({ x, y });
    }
  }
  Phaser.Utils.Array.Shuffle(brickPositions); // Shuffle positions

  // Place a few orange bricks randomly
  let orangeBrickCount = 4; // Number of orange bricks (reduced)
  let orangeIndices = Phaser.Utils.Array.Shuffle([
    ...Array(BRICK_ROWS * BRICK_COLS).keys(),
  ]).slice(0, orangeBrickCount);
  let i = 0;
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      let { x, y } = brickPositions[i];
      let spriteKey, hits, type;
      if (orangeIndices.includes(i)) {
        spriteKey = "brick_orange";
        hits = 1;
        type = "orange";
      } else if (row === 0) {
        spriteKey = "brick_blue";
        hits = 1;
        type = "blue";
      } else if (row < 3) {
        spriteKey = "brick_red_whole";
        hits = 2;
        type = "red";
      } else {
        spriteKey = "brick_green";
        hits = 1;
        type = "green";
      }
      let brick = this.add.sprite(x, y, spriteKey);
      brick.displayWidth = BRICK_WIDTH;
      brick.displayHeight = BRICK_HEIGHT;
      brick.setData("hits", hits);
      brick.setData("type", type);
      brick.setData("row", row);
      brick.setData("col", col);
      bricks.add(brick);
      i++;
    }
  }

  // UI bar background
  const uiBarColor = 0x333388; // More distinct from #222 background
  const uiBar = this.add.rectangle(
    config.width / 2,
    config.height - UI_BAR_HEIGHT / 2,
    config.width,
    UI_BAR_HEIGHT,
    uiBarColor
  );
  uiBar.setOrigin(0.5);
  uiBar.setDepth(100);

  // Move paddle up to make space for UI bar
  paddle.y = config.height - UI_BAR_HEIGHT - 20;
  paddle.body.updateFromGameObject();

  // Move ball start position up as well
  ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_SIZE / 2;
  ball.body.updateFromGameObject();

  // UI elements in the bar
  livesText = this.add.text(
    30,
    config.height - UI_BAR_HEIGHT + 15,
    "Lives: " + lives,
    {
      fontSize: "24px",
      fill: "#fff",
    }
  );
  livesText.setDepth(101);

  speedText = this.add.text(
    200,
    config.height - UI_BAR_HEIGHT + 15,
    "Speed: " + ballSpeed,
    {
      fontSize: "24px",
      fill: "#fff",
    }
  );
  speedText.setDepth(101);

  // SFX mute/unmute button
  const sfxButton = this.add
    .text(400, config.height - UI_BAR_HEIGHT + 15, "🔊 SFX", {
      fontSize: "24px",
      fill: "#fff",
      backgroundColor: "#444",
      padding: { left: 10, right: 10, top: 2, bottom: 2 },
      borderRadius: 5,
    })
    .setInteractive()
    .setDepth(101);
  sfxButton.on("pointerdown", () => {
    sfxMuted = !sfxMuted;
    sfxButton.setText(sfxMuted ? "🔇 SFX" : "🔊 SFX");
  });

  // Music mute/unmute button
  let musicMuted = false;
  const musicButton = this.add
    .text(520, config.height - UI_BAR_HEIGHT + 15, "🔊 Music", {
      fontSize: "24px",
      fill: "#fff",
      backgroundColor: "#444",
      padding: { left: 10, right: 10, top: 2, bottom: 2 },
      borderRadius: 5,
    })
    .setInteractive()
    .setDepth(101);
  musicButton.on("pointerdown", () => {
    musicMuted = !musicMuted;
    if (this.bgm) this.bgm.setMute(musicMuted);
    musicButton.setText(musicMuted ? "🔇 Music" : "🔊 Music");
  });

  // Mouse movement controls the paddle (left/right only)
  this.input.on("pointermove", (pointer) => {
    let newX = Phaser.Math.Clamp(
      pointer.x,
      PADDLE_WIDTH / 2,
      config.width - PADDLE_WIDTH / 2
    );
    paddle.x = newX;
    paddle.body.updateFromGameObject();
    // If ball not launched, keep it glued to paddle
    if (!ballLaunched) {
      ball.x = paddle.x;
      ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_SIZE / 2;
    }
  });

  // Launch the ball on mouse click
  this.input.on("pointerdown", (pointer) => {
    // Prevent launching if pointer is inside the UI bar
    if (
      pointer.y >= config.height - UI_BAR_HEIGHT &&
      pointer.y <= config.height
    ) {
      return;
    }
    if (!ballLaunched && lives > 0) {
      launchBall();
    }
  });

  // Set up collisions
  this.physics.add.collider(
    ball,
    paddle,
    (ballObj, paddleObj) => {
      ballHitPaddle.call(this, ballObj, paddleObj);
      playRandomBounce(this);
    },
    null,
    this
  );
  this.physics.add.collider(
    ball,
    bricks,
    (ballObj, brickObj) => {
      ballHitBrick.call(this, ballObj, brickObj);
      playRandomBounce(this);
    },
    null,
    this
  );

  // Set world bounds: no collision on the bottom
  this.physics.world.setBoundsCollision(true, true, true, false); // left, right, top, bottom

  // Play random bounce sound when ball hits left, right, or top world bounds
  ball.body.onWorldBounds = true;
  this.physics.world.on("worldbounds", (body, up, down, left, right) => {
    if (body.gameObject === ball && (up || left || right)) {
      playRandomBounce(this);
    }
  });

  // Draw a 1-pixel light-gray border around the whole screen (including UI bar)
  const border = this.add.graphics();
  border.lineStyle(1, 0xcccccc, 1);
  border.strokeRect(0.5, 0.5, config.width - 1, config.height - 1);
  border.setDepth(1000); // On top of everything
}

// Main game loop, runs every frame
function update() {
  // Keep ball speed constant
  if (ballLaunched) {
    let v = new Phaser.Math.Vector2(ball.body.velocity.x, ball.body.velocity.y);
    v = v.normalize().scale(ballSpeed);
    ball.body.setVelocity(v.x, v.y);
  }

  // Ball falls below the top of the UI bar: lose a life or game over
  if (ball.y > config.height - UI_BAR_HEIGHT) {
    if (!sfxMuted) this.sound.play("death");
    lives--;
    livesText.setText("Lives: " + lives);
    if (lives > 0) {
      resetBall.call(this);
    } else {
      // Instead of showing text, switch to GameOverScene
      this.scene.start("GameOverScene");
      return;
    }
  }

  // Manually check powerups for paddle collision or falling off screen
  powerups.forEach((p, idx) => {
    // Check for collision with paddle
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        paddle.getBounds(),
        p.getBounds()
      )
    ) {
      catchPowerup(paddle, p);
      powerups.splice(idx, 1);
      p.destroy();
    } else if (p.y > config.height + 20) {
      powerups.splice(idx, 1);
      p.destroy();
    }
  });

  // Ball rotation animation
  if (ballLaunched && ball && ball.body && ball.body.speed > 0) {
    // Rotation speed is 1/5000 of ball's travel speed (very slow)
    ball.rotation += (ball.body.speed / 5000) * ballRotationDir;
  }
}

// Reset the ball to the paddle (after losing a life or at start)
function resetBall() {
  ball.body.setVelocity(0, 0);
  ball.x = paddle.x;
  ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_SIZE / 2;
  ballLaunched = false;
  ball.body.setEnable(true);
}

// Launch the ball with a random angle
function launchBall() {
  // Always launch straight up from the paddle's center
  ball.body.setVelocity(0, -ballSpeed);
  ballLaunched = true;
}

// Ball hits paddle: bounce with angle depending on where it hits
function ballHitPaddle(ballObj, paddleObj) {
  let diff = ballObj.x - paddleObj.x;
  let norm = diff / (PADDLE_WIDTH / 2);
  let angle = norm * 60; // -60deg to 60deg
  let rad = Phaser.Math.DegToRad(angle);
  let speed = ballSpeed;
  ballObj.body.setVelocity(speed * Math.sin(rad), -speed * Math.cos(rad));
}

// Ball hits brick: reduce hits or destroy, spawn powerup if blue
function ballHitBrick(ballObj, brickObj) {
  let hits = brickObj.getData("hits");
  let type = brickObj.getData("type");
  let row = brickObj.getData("row");
  let col = brickObj.getData("col");
  if (hits > 1) {
    brickObj.setData("hits", hits - 1);
    // Change red brick to damaged sprite after first hit
    if (type === "red") {
      brickObj.setTexture("brick_red_damaged");
    }
  } else {
    handleBrickDestruction.call(this, brickObj);
  }
}

function handleBrickDestruction(brickObj) {
  if (!brickObj.active) return; // Prevent double-destruction
  bricks.remove(brickObj); // Remove from group to avoid recursion
  const type = brickObj.getData("type");
  if (type === "blue") {
    spawnPowerup.call(this, brickObj.x, brickObj.y);
  }
  if (type === "orange") {
    // Visual explosion effect
    const explosionRadius = Math.max(BRICK_WIDTH, BRICK_HEIGHT) * 1.5; // Reduced radius
    const bx = brickObj.x;
    const by = brickObj.y;
    // Create a white circle at the brick's position
    const explosion = this.add.circle(bx, by, 10, 0xffffff, 0.5);
    explosion.setDepth(10);
    this.tweens.add({
      targets: explosion,
      radius: explosionRadius,
      alpha: 0,
      duration: 350,
      ease: "Cubic.easeOut",
      onComplete: () => explosion.destroy(),
    });
    // Destroy all bricks within the explosion radius
    const toDestroy = [];
    bricks.getChildren().forEach((b) => {
      if (b === brickObj) return;
      const dx = b.x - bx;
      const dy = b.y - by;
      if (Math.sqrt(dx * dx + dy * dy) <= explosionRadius) {
        toDestroy.push(b);
      }
    });
    toDestroy.forEach((b) => {
      handleBrickDestruction.call(this, b);
      b.destroy();
    });
    if (!sfxMuted) this.sound.play("explosion");
  }
  brickObj.destroy();
}

// Spawn a powerup (red = speed up, yellow = slow down)
function spawnPowerup(x, y) {
  let isRed = Phaser.Math.Between(0, 1) === 1;
  let color = isRed ? 0xff2222 : 0xffff44;
  let type = isRed ? "speedup" : "slowdown";
  let powerup = this.add.circle(x, y, 14, color);
  this.physics.add.existing(powerup); // Add dynamic physics body
  powerup.body.setVelocity(0, 150); // Move straight down
  powerup.body.setImmovable(false);
  powerup.body.setAllowGravity(false);
  powerup.setData("type", type);
  powerups.push(powerup);
}

// Handle catching a powerup with the paddle
function catchPowerup(paddleObj, powerupObj) {
  let type = powerupObj.getData("type");
  if (type === "speedup") {
    ballSpeed = Math.min(ballSpeed + 50, 400);
  } else if (type === "slowdown") {
    ballSpeed = Math.max(ballSpeed - 30, 50);
  }
  speedText.setText("Speed: " + ballSpeed);
  if (!sfxMuted) paddleObj.scene.sound.play("powerUp");
}

function playRandomBounce(scene) {
  if (sfxMuted) return;
  const idx = Phaser.Math.Between(1, 5);
  scene.sound.play("bounce-var" + idx);
  // 20% chance to reverse ball rotation direction
  if (Phaser.Math.FloatBetween(0, 1) < 0.2) {
    ballRotationDir *= -1;
  }
}
