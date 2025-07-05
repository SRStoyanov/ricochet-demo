// Game constants
export const GAME_CONFIG = {
  PADDLE_WIDTH: 120,
  PADDLE_HEIGHT: 20,
  BALL_SIZE: 16,
  BRICK_ROWS: 6,
  BRICK_COLS: 10,
  BRICK_WIDTH: 64,
  BRICK_HEIGHT: 32,
  START_BALL_SPEED: 200,
  POWERUP_SPEED: 60,
  MAX_LIVES: 3,
  UI_BAR_HEIGHT: 60,
  EXPLOSION_RADIUS_MULTIPLIER: 1.5,
  EXPLOSION_DURATION: 350,
  POWERUP_RADIUS: 14,
  POWERUP_FALL_SPEED: 150,
  SPEED_INCREASE: 50,
  SPEED_DECREASE: 30,
  MAX_BALL_SPEED: 400,
  MIN_BALL_SPEED: 50,
  PADDLE_ANGLE_RANGE: 60, // degrees
  BALL_ROTATION_REVERSE_CHANCE: 0.2,
  STAR_COUNT: 80
};

// Colors
export const COLORS = {
  ORANGE: 0xffa500,
  UI_BAR: 0x333388,
  BACKGROUND: '#111',
  BORDER: 0xcccccc,
  WHITE: 0xffffff,
  POWERUP_SPEED: 0xff2222,
  POWERUP_SLOW: 0xffff44,
  STAR_COLORS: [0xffffff, 0xffff66]
};

// Brick types configuration
export const BRICK_TYPES = {
  BLUE: {
    sprite: 'brick_blue',
    hits: 1,
    type: 'blue',
    spawns_powerup: true
  },
  RED: {
    sprite: 'brick_red_whole',
    damaged_sprite: 'brick_red_damaged',
    hits: 2,
    type: 'red',
    spawns_powerup: false
  },
  GREEN: {
    sprite: 'brick_green',
    hits: 1,
    type: 'green',
    spawns_powerup: false
  },
  ORANGE: {
    sprite: 'brick_orange',
    hits: 1,
    type: 'orange',
    spawns_powerup: false,
    explodes: true
  }
};

// Powerup types
export const POWERUP_TYPES = {
  SPEEDUP: {
    type: 'speedup',
    color: COLORS.POWERUP_SPEED,
    effect: 'speed_increase'
  },
  SLOWDOWN: {
    type: 'slowdown',
    color: COLORS.POWERUP_SLOW,
    effect: 'speed_decrease'
  }
};

// Audio settings
export const AUDIO = {
  BGM_VOLUME: 0.5,
  SFX_BOUNCE_VARIANTS: 5 // bounce-var1 through bounce-var5
};

// Scene names
export const SCENES = {
  TITLE: 'TitleScene',
  MAIN: 'MainScene',
  GAME_OVER: 'GameOverScene',
  VICTORY: 'VictoryScene'
};
