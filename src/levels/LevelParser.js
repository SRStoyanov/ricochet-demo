import { BRICK_TYPES, GAME_CONFIG } from '../config/constants.js';
import { Brick } from '../entities/Brick.js';

export class LevelParser {
  constructor() {
    this.brickCharMap = {
      'B': 'blue',     // Blue brick (spawns powerups)
      'R': 'red',      // Red brick (2 hits)
      'G': 'green',    // Green brick (1 hit)
      'O': 'orange',   // Orange brick (explodes)
      'X': 'special',  // Special brick (custom behavior)
      '.': 'empty',    // Empty space
      ' ': 'empty',    // Empty space (alternative)
      '#': 'wall'      // Indestructible wall
    };

    this.specialBricks = {
      'M': 'metal',    // Metal brick (3 hits)
      'D': 'diamond',  // Diamond brick (5 hits)
      'P': 'power',    // Power brick (guaranteed powerup)
      'C': 'chain',    // Chain brick (spreads destruction)
      'T': 'teleport', // Teleport brick (moves ball randomly)
      'S': 'shield'    // Shield brick (reflects certain effects)
    };
  }

  /**
   * Parse a level from text format
   * @param {string} levelText - The level text data
   * @param {Object} options - Parsing options
   * @returns {Object} Parsed level data
   */
  parseLevel(levelText, options = {}) {
    const lines = levelText.trim().split('\n');
    const levelData = {
      bricks: [],
      metadata: {
        name: 'Custom Level',
        difficulty: 'normal',
        description: '',
        author: 'Unknown'
      },
      config: {
        paddleSpeed: GAME_CONFIG.START_BALL_SPEED,
        ballSpeed: GAME_CONFIG.START_BALL_SPEED,
        lives: GAME_CONFIG.MAX_LIVES,
        powerupsEnabled: true,
        specialRules: []
      }
    };

    let currentSection = 'bricks';
    let brickRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (line === '') continue;

      // Handle section headers
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.slice(1, -1).toLowerCase();
        continue;
      }

      // Handle metadata
      if (currentSection === 'metadata') {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value) {
          levelData.metadata[key] = value;
        }
        continue;
      }

      // Handle config
      if (currentSection === 'config') {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key && value) {
          // Convert numeric values
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            levelData.config[key] = numValue;
          } else if (value === 'true' || value === 'false') {
            levelData.config[key] = value === 'true';
          } else {
            levelData.config[key] = value;
          }
        }
        continue;
      }

      // Handle special rules
      if (currentSection === 'rules') {
        levelData.config.specialRules.push(line);
        continue;
      }

      // Handle brick layout
      if (currentSection === 'bricks' || currentSection === 'layout') {
        brickRows.push(line);
      }
    }

    // Process brick layout
    levelData.bricks = this.processBrickLayout(brickRows, options);

    return levelData;
  }

  /**
   * Process brick layout from text rows
   * @param {string[]} rows - Array of text rows representing brick layout
   * @param {Object} options - Processing options
   * @returns {Array} Array of brick definitions
   */
  processBrickLayout(rows, options = {}) {
    const bricks = [];
    const maxCols = Math.max(...rows.map(row => row.length));

    // Calculate brick positioning
    const brickSpacing = options.brickSpacing || 4;
    const startX = options.startX || this.calculateStartX(maxCols);
    const startY = options.startY || 60;

    for (let row = 0; row < rows.length; row++) {
      const rowText = rows[row];

      for (let col = 0; col < rowText.length; col++) {
        const char = rowText[col];
        const brickType = this.getBrickTypeFromChar(char);

        if (brickType && brickType !== 'empty') {
          const x = startX + col * (GAME_CONFIG.BRICK_WIDTH + brickSpacing);
          const y = startY + row * (GAME_CONFIG.BRICK_HEIGHT + brickSpacing);

          bricks.push({
            x,
            y,
            type: brickType,
            row,
            col,
            char,
            special: this.getSpecialProperties(char)
          });
        }
      }
    }

    return bricks;
  }

  /**
   * Get brick type from character
   * @param {string} char - Character representing brick type
   * @returns {string} Brick type name
   */
  getBrickTypeFromChar(char) {
    // Check standard brick types
    if (this.brickCharMap[char]) {
      return this.brickCharMap[char];
    }

    // Check special brick types
    if (this.specialBricks[char]) {
      return this.specialBricks[char];
    }

    // Unknown character defaults to empty
    return 'empty';
  }

  /**
   * Get special properties for a brick character
   * @param {string} char - Character representing brick type
   * @returns {Object} Special properties object
   */
  getSpecialProperties(char) {
    const properties = {
      explodes: false,
      spawns_powerup: false,
      hits: 1,
      indestructible: false,
      special_effect: null
    };

    switch (char) {
      case 'B':
        properties.spawns_powerup = true;
        break;
      case 'R':
        properties.hits = 2;
        break;
      case 'O':
        properties.explodes = true;
        break;
      case 'M':
        properties.hits = 3;
        break;
      case 'D':
        properties.hits = 5;
        break;
      case 'P':
        properties.spawns_powerup = true;
        properties.special_effect = 'guaranteed_powerup';
        break;
      case 'C':
        properties.special_effect = 'chain_reaction';
        break;
      case 'T':
        properties.special_effect = 'teleport';
        break;
      case 'S':
        properties.special_effect = 'shield';
        break;
      case '#':
        properties.indestructible = true;
        properties.hits = -1;
        break;
    }

    return properties;
  }

  /**
   * Calculate starting X position for centered brick layout
   * @param {number} maxCols - Maximum number of columns
   * @returns {number} Starting X position
   */
  calculateStartX(maxCols) {
    const totalWidth = maxCols * GAME_CONFIG.BRICK_WIDTH + (maxCols - 1) * 4;
    return (800 - totalWidth) / 2 + GAME_CONFIG.BRICK_WIDTH / 2; // 800 is game width
  }

  /**
   * Create bricks from parsed level data
   * @param {Object} scene - Phaser scene
   * @param {Object} levelData - Parsed level data
   * @param {Object} bricksGroup - Phaser physics group for bricks
   * @returns {Array} Array of created brick instances
   */
  createBricksFromLevel(scene, levelData, bricksGroup) {
    const bricks = [];

    levelData.bricks.forEach(brickData => {
      // Map parsed brick types to existing brick types
      let actualType = brickData.type;

      // Handle special brick types that need to map to existing types
      if (brickData.type === 'metal') actualType = 'red';
      if (brickData.type === 'diamond') actualType = 'blue';
      if (brickData.type === 'power') actualType = 'blue';
      if (brickData.type === 'wall') actualType = 'green';

      try {
        const brick = new Brick(scene, brickData.x, brickData.y, actualType);

        // Apply special properties
        if (brickData.special) {
          if (brickData.special.hits > 0) {
            brick.hits = brickData.special.hits;
            brick.sprite.setData('hits', brick.hits);
          }

          if (brickData.special.indestructible) {
            brick.sprite.setData('indestructible', true);
          }

          if (brickData.special.special_effect) {
            brick.sprite.setData('special_effect', brickData.special.special_effect);
          }
        }

        // Set position data
        brick.sprite.setData('row', brickData.row);
        brick.sprite.setData('col', brickData.col);
        brick.sprite.setData('levelChar', brickData.char);

        bricksGroup.add(brick.sprite);
        bricks.push(brick);
      } catch (error) {
        console.warn(`Failed to create brick at ${brickData.x}, ${brickData.y}:`, error);
      }
    });

    return bricks;
  }

  /**
   * Load level from URL
   * @param {string} url - URL to level file
   * @returns {Promise<Object>} Promise resolving to parsed level data
   */
  async loadLevelFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load level: ${response.status}`);
      }
      const levelText = await response.text();
      return this.parseLevel(levelText);
    } catch (error) {
      console.error('Error loading level:', error);
      throw error;
    }
  }

  /**
   * Validate level data
   * @param {Object} levelData - Level data to validate
   * @returns {Object} Validation result
   */
  validateLevel(levelData) {
    const errors = [];
    const warnings = [];

    // Check if level has bricks
    if (!levelData.bricks || levelData.bricks.length === 0) {
      errors.push('Level must contain at least one brick');
    }

    // Check brick positions
    levelData.bricks.forEach((brick, index) => {
      if (typeof brick.x !== 'number' || typeof brick.y !== 'number') {
        errors.push(`Brick ${index} has invalid position`);
      }

      if (!brick.type || brick.type === 'empty') {
        warnings.push(`Brick ${index} has empty type`);
      }
    });

    // Check metadata
    if (!levelData.metadata.name) {
      warnings.push('Level missing name');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get example level format
   * @returns {string} Example level text
   */
  getExampleLevel() {
    return `[metadata]
name=Example Level
difficulty=normal
description=A simple example level
author=Level Designer

[config]
ballSpeed=200
lives=3
powerupsEnabled=true

[bricks]
BBBBBBBBB
RRRRRRRRR
GGGGGGGGG
...OOO...
.........
BRBRBRBR.
GGGGGGGGG

[rules]
Orange bricks explode when hit
Blue bricks spawn powerups
Red bricks need 2 hits`;
  }
}

// Export singleton instance
export const levelParser = new LevelParser();
