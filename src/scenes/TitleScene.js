import { Starfield } from "../entities/Starfield.js";
import { SCENES, AUDIO } from "../config/constants.js";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.TITLE);
  }

  preload() {
    // Assets are loaded in the main preload function
    this.load.image("paddle", "assets/graphics/sprites/paddle.png");
    this.load.image("ball", "assets/graphics/sprites/ball.png");
    this.load.image("brick_blue", "assets/graphics/sprites/brick-blue.png");
    this.load.image(
      "brick_red_whole",
      "assets/graphics/sprites/brick-red-whole.png",
    );
    this.load.image(
      "brick_red_damaged",
      "assets/graphics/sprites/brick-red-damaged.png",
    );
    this.load.image("brick_green", "assets/graphics/sprites/brick-green.png");
    this.load.image("brick_orange", "assets/graphics/sprites/brick-orange.png");
    this.load.audio("bgm", "assets/music/GalacticRap.mp3");
    this.load.audio("bounce-var1", "assets/sounds/bounce-var1.wav");
    this.load.audio("bounce-var2", "assets/sounds/bounce-var2.wav");
    this.load.audio("bounce-var3", "assets/sounds/bounce-var3.wav");
    this.load.audio("bounce-var4", "assets/sounds/bounce-var4.wav");
    this.load.audio("bounce-var5", "assets/sounds/bounce-var5.wav");
    this.load.audio("powerUp", "assets/sounds/powerUp.wav");
    this.load.audio("explosion", "assets/sounds/explosion.wav");
    this.load.audio("death", "assets/sounds/death.wav");
  }

  create() {
    // Create starfield background
    this.starfield = new Starfield(
      this,
      this.game.config.width,
      this.game.config.height,
    );

    // Play background music if not already playing
    if (!this.sound.get("bgm")) {
      this.bgm = this.sound.add("bgm", {
        loop: true,
        volume: AUDIO.BGM_VOLUME,
      });
      this.bgm.play();
    } else {
      this.bgm = this.sound.get("bgm");
      if (!this.bgm.isPlaying) {
        this.bgm.play();
      }
    }

    // Set background color
    this.cameras.main.setBackgroundColor("#111");

    // Title text
    this.add
      .text(this.game.config.width / 2, 180, "Rogueochet Demo", {
        fontSize: "48px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Start button
    const startBtn = this.add
      .text(this.game.config.width / 2, 320, "Start", {
        fontSize: "36px",
        fill: "#fff",
        backgroundColor: "#333388",
        padding: { left: 30, right: 30, top: 10, bottom: 10 },
        borderRadius: 10,
      })
      .setOrigin(0.5)
      .setInteractive();

    startBtn.on("pointerdown", () => {
      this.scene.start(SCENES.MAIN);
    });

    // Add hover effects
    startBtn.on("pointerover", () => {
      startBtn.setStyle({ backgroundColor: "#4444aa" });
    });

    startBtn.on("pointerout", () => {
      startBtn.setStyle({ backgroundColor: "#333388" });
    });

    // ESC key support - could be used for settings or exit in future
    this.input.keyboard.on("keydown-ESC", () => {
      // For now, just start the game like clicking Start
      this.scene.start(SCENES.MAIN);
    });

    // Space key as alternative to start
    this.input.keyboard.on("keydown-SPACE", () => {
      this.scene.start(SCENES.MAIN);
    });
  }

  update() {
    if (this.starfield) {
      this.starfield.update();
    }
  }
}
