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

## Sound Effects

- **Bounce:** One of five random bounce sounds (`bounce-var1.wav` to `bounce-var5.wav`) plays whenever the ball bounces off the paddle, bricks, or the walls/ceiling.
- **Death:** `death.wav` plays when the ball falls through the bottom of the screen and you lose a life.
- **Explosion:** `explosion.wav` plays when an orange brick explodes.
- **Power Up:** `powerUp.wav` plays when you catch a powerup with the paddle.

All sound files are located in `assets/sounds/`.
Sound files were created using https://sfxr.me/

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
