# Ricochet Demo - Modular Structure

This document explains the new modular structure of the Ricochet breakout game, which has been refactored from a single large file into a well-organized, maintainable codebase.

## 🏗️ Project Structure

```
ricochet-demo/
├── src/
│   ├── config/
│   │   ├── constants.js          # Game constants and configuration
│   │   └── gameConfig.js         # Phaser config and game state
│   ├── entities/
│   │   ├── Brick.js              # Brick entity class
│   │   ├── Powerup.js            # Powerup entity class
│   │   └── Starfield.js          # Background starfield effect
│   ├── scenes/
│   │   ├── TitleScene.js         # Main menu scene
│   │   ├── MainScene.js          # Game scene
│   │   ├── GameOverScene.js      # Game over scene
│   │   └── VictoryScene.js       # Victory scene
│   ├── systems/
│   │   ├── BrickSystem.js        # Brick management system
│   │   └── PowerupSystem.js      # Powerup management system
│   ├── levels/
│   │   ├── LevelParser.js        # Level parser for text-based levels
│   │   ├── level1.txt            # Example level 1
│   │   └── level2.txt            # Example level 2
│   ├── utils/
│   │   └── gameUtils.js          # Utility functions
│   └── main.js                   # Main game initialization
├── assets/                       # Game assets (images, sounds)
├── index.html                    # Original monolithic version
├── index-modular.html            # New modular version
├── game.js                       # Original single file
└── README-MODULAR.md             # This file
```

## 🎮 How It Works

### Core Architecture

The game now follows a modular Entity-Component-System (ECS) inspired architecture:

1. **Entities**: Game objects like Bricks, Powerups, and Starfield
2. **Systems**: Logic managers like BrickSystem and PowerupSystem  
3. **Scenes**: Different game states (Title, Main, GameOver, Victory)
4. **Configuration**: Centralized constants and settings

### Key Components

#### 📁 Config Directory
- `constants.js`: All game constants, colors, and configuration values
- `gameConfig.js`: Phaser configuration and global game state

#### 🎪 Entities Directory
- `Brick.js`: Individual brick logic with different types and behaviors
- `Powerup.js`: Powerup entities with various effects
- `Starfield.js`: Animated background stars

#### 🎬 Scenes Directory
- `TitleScene.js`: Main menu with starfield background
- `MainScene.js`: Core gameplay logic
- `GameOverScene.js`: Game over screen with restart options
- `VictoryScene.js`: Victory screen with celebration effects

#### ⚙️ Systems Directory
- `BrickSystem.js`: Manages brick creation, destruction, and explosions
- `PowerupSystem.js`: Handles powerup spawning, collection, and effects

#### 🗺️ Levels Directory
- `LevelParser.js`: Parses text-based level files
- Text level files with brick layouts and metadata

## 🧱 Brick System

### Brick Types
- **Blue (B)**: Spawns powerups when destroyed
- **Red (R)**: Requires 2 hits to destroy
- **Green (G)**: Standard brick, 1 hit to destroy
- **Orange (O)**: Explodes when hit, damaging nearby bricks
- **Wall (#)**: Indestructible (level parser only)

### Special Properties
Each brick can have:
- Hit count (how many hits to destroy)
- Powerup spawning ability
- Explosion capability
- Special effects

## 🎯 Powerup System

### Powerup Types
- **Speed Up (Red)**: Increases ball speed
- **Slow Down (Yellow)**: Decreases ball speed

### Extensibility
New powerup types can be easily added by:
1. Adding to `POWERUP_TYPES` in constants.js
2. Implementing effect logic in `Powerup.js`
3. Adding visual representation

## 🗺️ Level Parser

### Text Format
Levels are defined in simple text files:

```
[metadata]
name=Level Name
difficulty=easy
description=Level description
author=Your Name

[config]
ballSpeed=200
lives=3
powerupsEnabled=true

[bricks]
BBBBBBBBB
RRRRRRRRR
GGGGGGGGG
..OOO..
.......

[rules]
Blue bricks spawn powerups
Red bricks need 2 hits
Orange bricks explode when hit
```

### Character Mapping
- `B` = Blue brick (spawns powerups)
- `R` = Red brick (2 hits)
- `G` = Green brick (1 hit)
- `O` = Orange brick (explodes)
- `#` = Wall brick (indestructible)
- `.` = Empty space
- ` ` = Empty space

### Usage
```javascript
import { levelParser } from './src/levels/LevelParser.js';

// Load level from URL
const levelData = await levelParser.loadLevelFromUrl('src/levels/level1.txt');

// Create bricks from level
const bricks = levelParser.createBricksFromLevel(scene, levelData, bricksGroup);
```

## 🚀 Getting Started

### Running the Modular Version
1. Open `index-modular.html` in a modern web browser
2. The game will load using ES6 modules
3. All functionality from the original game is preserved

### Development
1. Each component is self-contained and can be modified independently
2. Use browser developer tools to debug individual modules
3. The game object is available globally as `window.game`

### Adding New Features

#### New Brick Type
1. Add to `BRICK_TYPES` in `constants.js`
2. Implement logic in `Brick.js`
3. Add character mapping in `LevelParser.js`

#### New Powerup
1. Add to `POWERUP_TYPES` in `constants.js`
2. Implement effect in `Powerup.js`
3. Update `PowerupSystem.js` if needed

#### New Scene
1. Create scene file in `src/scenes/`
2. Add to scene list in `main.js`
3. Update navigation in other scenes

## 🎨 Customization

### Visual Customization
- Modify colors in `constants.js`
- Update game dimensions in `gameConfig.js`
- Adjust UI layout in `MainScene.js`

### Gameplay Customization
- Adjust physics values in `constants.js`
- Modify powerup effects in `Powerup.js`
- Change brick behavior in `Brick.js`

### Audio Customization
- Update audio settings in `constants.js`
- Modify sound triggers in respective systems

## 🔧 Technical Benefits

### Maintainability
- Code is organized into logical modules
- Each component has a single responsibility
- Easy to locate and fix bugs

### Extensibility
- New features can be added without modifying existing code
- Systems can be swapped out independently
- Level creation is now data-driven

### Testability
- Individual components can be tested in isolation
- Game logic is separated from presentation
- Mock dependencies can be injected

### Performance
- Modules are loaded on-demand
- Systems manage their own state
- Efficient collision detection and object pooling

## 📝 Development Notes

### Browser Compatibility
- Requires modern browser with ES6 module support
- Uses Phaser 3 for game engine
- No build process required for development

### Debugging
- Use browser DevTools to inspect individual modules
- Game state is accessible via `window.game`
- Debug helpers available in development mode

### Future Enhancements
- Add sound system module
- Implement particle effects system
- Create level editor interface
- Add multiplayer support
- Implement save/load functionality

## 🤝 Contributing

When adding new features:
1. Follow the existing modular structure
2. Keep components focused on single responsibilities
3. Update constants.js for new configuration values
4. Add proper error handling and validation
5. Document new level format features

## 📄 License

Same license as the original game.