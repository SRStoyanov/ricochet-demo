// Phaser game configuration object
const config = {
  type: Phaser.AUTO, // Use WebGL if available, otherwise fall back to Canvas
  width: 800, // Game width in pixels
  height: 600, // Game height in pixels
  backgroundColor: "#222", // Background color
  physics: {
    default: "arcade", // Use Arcade Physics
    arcade: {
      gravity: { y: 0 }, // No gravity by default
      debug: false, // Set to true to see physics bodies
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

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

// Create the Phaser game instance
const game = new Phaser.Game(config);

// Preload assets (none needed for this game)
function preload() {}

// Create game objects and set up the scene
function create() {
  // Create the player's paddle as a white rectangle
  paddle = this.add.rectangle(
    config.width / 2,
    config.height - 40,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    0xffffff
  );
  this.physics.add.existing(paddle, true); // Add static physics body
  paddleBody = paddle.body;

  // Create the ball as a yellow circle
  ball = this.add.circle(
    config.width / 2,
    config.height - 60,
    BALL_SIZE / 2,
    0xffff00
  );
  this.physics.add.existing(ball); // Add dynamic physics body
  ball.body.setCollideWorldBounds(true, 1, 1); // Ball bounces off walls
  ball.body.setBounce(1, 1); // Full bounce
  resetBall.call(this); // Start with ball glued to paddle

  // Create and randomize brick positions
  bricks = this.physics.add.staticGroup(); // Bricks are static
  let brickPositions = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      let x = 64 + col * (BRICK_WIDTH + 4);
      let y = 60 + row * (BRICK_HEIGHT + 4);
      brickPositions.push({ x, y });
    }
  }
  Phaser.Utils.Array.Shuffle(brickPositions); // Shuffle positions

  // Place a few orange bricks randomly
  let orangeBrickCount = 8; // Number of orange bricks
  let orangeIndices = Phaser.Utils.Array.Shuffle([
    ...Array(BRICK_ROWS * BRICK_COLS).keys(),
  ]).slice(0, orangeBrickCount);
  let i = 0;
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      let { x, y } = brickPositions[i];
      let color, hits, type;
      if (orangeIndices.includes(i)) {
        color = ORANGE;
        hits = 1;
        type = "orange";
      } else if (row === 0) {
        color = 0x3399ff; // Blue bricks
        hits = 1;
        type = "blue";
      } else if (row < 3) {
        color = 0xff4444; // Red bricks
        hits = 2;
        type = "red";
      } else {
        color = 0x44ff44; // Green bricks
        hits = 1;
        type = "green";
      }
      let brick = this.add.rectangle(x, y, BRICK_WIDTH, BRICK_HEIGHT, color);
      brick.setData("hits", hits);
      brick.setData("color", color);
      brick.setData("type", type);
      brick.setData("row", row);
      brick.setData("col", col);
      bricks.add(brick);
      i++;
    }
  }

  // UI elements
  gameOverText = this.add
    .text(config.width / 2, config.height / 2, "", {
      fontSize: "48px",
      fill: "#fff",
    })
    .setOrigin(0.5);
  livesText = this.add.text(20, 10, "Lives: " + lives, {
    fontSize: "24px",
    fill: "#fff",
  });
  speedText = this.add.text(20, 40, "Speed: " + ballSpeed, {
    fontSize: "24px",
    fill: "#fff",
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
    if (!ballLaunched && lives > 0) {
      launchBall();
    }
  });

  // Set up collisions
  this.physics.add.collider(ball, paddle, ballHitPaddle, null, this); // Ball bounces off paddle
  this.physics.add.collider(ball, bricks, ballHitBrick, null, this); // Ball hits bricks

  // Set world bounds: no collision on the bottom
  this.physics.world.setBoundsCollision(true, true, true, false); // left, right, top, bottom
}

// Main game loop, runs every frame
function update() {
  // Keep ball speed constant
  if (ballLaunched) {
    let v = new Phaser.Math.Vector2(ball.body.velocity.x, ball.body.velocity.y);
    v = v.normalize().scale(ballSpeed);
    ball.body.setVelocity(v.x, v.y);
  }

  // Ball falls below screen: lose a life or game over
  if (ball.y > config.height) {
    lives--;
    livesText.setText("Lives: " + lives);
    if (lives > 0) {
      resetBall.call(this);
    } else {
      gameOverText.setText("Game Over!");
      ball.body.setVelocity(0, 0);
      ball.body.setEnable(false);
      ballLaunched = false;
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
  let angle = Phaser.Math.Between(-60, 60);
  let rad = Phaser.Math.DegToRad(angle);
  ball.body.setVelocity(ballSpeed * Math.sin(rad), -ballSpeed * Math.cos(rad));
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
    brickObj.fillColor = 0x44ff44; // Change to green after first hit
  } else {
    if (type === "blue") {
      spawnPowerup.call(this, brickObj.x, brickObj.y);
    }
    if (type === "orange") {
      // Visual explosion effect
      const explosionRadius = Math.max(BRICK_WIDTH, BRICK_HEIGHT) * 2.2; // Wider radius
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
      toDestroy.forEach((b) => b.destroy());
    }
    brickObj.destroy();
  }
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
}
