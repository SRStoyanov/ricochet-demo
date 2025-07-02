# Ricochet Breakout Game

A simple 2D breakout/ricochet game built with [Phaser 3](https://phaser.io/). The player controls a paddle to keep the ball in play, break bricks, and catch powerups.

## Gameplay

- **Move the paddle** left and right with your mouse (the paddle follows the mouse X position).
- **The ball** starts glued to the paddle. Click the left mouse button to launch it.
- **Break bricks** by bouncing the ball into them.
  - Green bricks take 1 hit.
  - Red bricks take 2 hits.
  - Blue bricks take 1 hit and always drop a powerup.
  - **Orange bricks** take 1 hit and, when broken, **explode**: they destroy all nearby bricks in a radius and show a white expanding explosion effect.
- **Catch powerups** with your paddle as they fall. Red powerups speed up the ball, yellow powerups slow it down.
- **You have 3 lives.** If the ball falls below the paddle, you lose a life. The game ends when you run out of lives.
- **Bricks are randomized** each game for replayability.

## Features

- Paddle with mouse control
- Ball with constant speed and realistic bounce
- 4 types of bricks (green, red, blue, orange)
- Orange bricks explode and destroy nearby bricks with a visual effect
- Powerups that drop from blue bricks and fall straight down
- UI showing lives and current ball speed
- Game over state
- **Sound effects for all major actions**
- **Background music that loops during gameplay**

## Sound Effects

- **Bounce:** One of five random bounce sounds (`bounce-var1.wav` to `bounce-var5.wav`) plays whenever the ball bounces off the paddle, bricks, or the walls/ceiling.
- **Death:** `death.wav` plays when the ball falls through the bottom of the screen and you lose a life.
- **Explosion:** `explosion.wav` plays when an orange brick explodes.
- **Power Up:** `powerUp.wav` plays when you catch a powerup with the paddle.

All sound files are located in `assets/sounds/`.
Sound files were created using https://sfxr.me/

## Music

- **Background music:** `GalacticRap.mp3` plays and loops throughout the game.
- **Source:** [incompetech.com Royalty-Free Music](https://incompetech.com/music/royalty-free/music.html)
- The music file is located in `assets/music/`.

## UI and Controls

- The game starts with a **title screen** displaying the game name ("Rogueochet Demo") and a **Start** button. Background music begins here and continues throughout the game.
- After losing all lives, a **Game Over screen** appears with a red background, a "Game Over!" message, and a clearly visible **Restart** button.
- **Victory screen:** When all bricks are destroyed, a bright yellow Victory screen appears with a "Victory!" message and a **Restart** button.
- Clicking **Restart** resets your lives to 3 and starts a new game.
- The bottom of the screen features a distinct horizontal UI bar, visually separated from the play area.
- The UI bar displays:
  - **Lives** (number of remaining balls)
  - **Ball Speed** (current speed of the ball)
  - **Mute/Unmute buttons** for both SFX and music
- **Mute/Unmute SFX:** Click the "🔊 SFX" or "🔇 SFX" button to toggle all sound effects (bounce, death, explosion, powerup) on or off. This does not affect the music.
- **Mute/Unmute Music:** Click the "🔊 Music" or "🔇 Music" button to toggle the background music on or off. This does not affect sound effects.
- Clicking within the UI bar will not launch the ball, so you can safely interact with the UI without affecting gameplay.

## Sprites and Graphics

- The **background** is a procedurally generated, animated starfield of white and yellow stars on a dark sky. The stars twinkle slowly and are always drawn behind all other game elements. This starfield is visible on both the title screen and the main gameplay screen, but not on the game over screen. The stars are purely visual and have no collision or interaction.
- The **paddle** uses a custom PNG sprite (`paddle.png`) for its appearance.
- The **ball** uses a custom PNG sprite (`ball.png`) and rotates as it moves for a dynamic effect.
- **Bricks** use custom PNG sprites for each type:
  - `brick-green.png` for green bricks
  - `brick-blue.png` for blue bricks
  - `brick-orange.png` for orange bricks
  - `brick-red-whole.png` for undamaged red bricks
  - `brick-red-damaged.png` for red bricks after one hit
- All sprites are sized in-game to match the intended gameplay dimensions (e.g., bricks are 64x32 pixels).
- Sprites are stored in `assets/graphics/sprites/`.

## How to Run

1. Make sure you have a modern web browser (Chrome, Firefox, Edge, etc).
2. Download or clone this repository.
3. Open `index.html` in your browser.

No build step or server is required—everything runs locally in your browser.

## File Overview

- `index.html` — Loads Phaser and the game script.
- `game.js` — All game logic, with detailed comments for learning Phaser.

---

Enjoy playing and feel free to modify or extend the game!
