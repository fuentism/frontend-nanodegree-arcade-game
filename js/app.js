// A helper to randomly pick a value from an array
var randomArrayVal = function (arr) {
    var randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
};

// A helper to randomly pick a row from the stone rows
var randomRow = function () {
    var rowPos = [55, 135, 220];
    return randomArrayVal(rowPos);
};

// Boolean check for whether two items intersect
var itemsIntersect = function (a, b) {
    return (Math.abs(a.x - b.x) * 2 < (a.width + b.width)) &&
        (Math.abs(a.y - b.y) * 2 < (a.height + b.height));
};

// Game class
// Handles scoring, game overs, game resets
var Game = function () {
    // Setup defaults
    this.defaultLevel = 1;
    this.defaultScore = 0;
    this.defaultLives = 2;

    // These are the vals that will change as the game goes on
    this.level = this.defaultLevel;
    this.score = this.defaultScore;
    this.lives = this.defaultLives;
};

Game.prototype.start = function () {
    // reset game, reset score board,
    // start listening for player movements
    this.updateScoreBoard();
    document.addEventListener('keyup', moveByKeys);
};

Game.prototype.updateScoreBoard = function () {
    var livesWrap = document.getElementById('lives'),
        levelWrap = document.getElementById('level'),
        scoreWrap = document.getElementById('score');

    livesWrap.innerHTML = this.lives;
    levelWrap.innerHTML = this.level;
    scoreWrap.innerHTML = this.score;
};

Game.prototype.reset = function () {
    game = new Game();
    game.start();
};

Game.prototype.gameOver = function () {

    // Take away player's abilities to move around the screen
    document.removeEventListener('keyup', moveByKeys);

    // create an overlay with a game over mssg and a reset button
    var canvas = document.getElementsByTagName('canvas')[0],
        gameOverWrap = document.createElement('div'),
        resetBtn = document.createElement('button'),
        stats = document.getElementById('stats-list');

    stats.parentNode.insertBefore(gameOverWrap, stats.nextSibling);

    gameOverWrap.className = 'game-over';
    gameOverWrap.innerHTML = '<h2>Game Over</h2>';
    gameOverWrap.appendChild(resetBtn);

    resetBtn.className = 'reset-button';
    resetBtn.innerHTML = 'Try Again';

    resetBtn.addEventListener('click', function () {
         gameOverWrap.parentNode.removeChild(gameOverWrap);
         game.reset();
    });
};

// Used to increase points in the game's score
Game.prototype.scoreUp = function (points) {
    this.score += points;
    this.updateScoreBoard();

    // Level One threshold
    if (this.score % 20 === 0) {
        this.levelUp();
    }
};

// Increases the level of the game
Game.prototype.levelUp = function () {
    this.level++;
    this.updateScoreBoard();
};

// Enemy class
var Enemy = function () {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    // Setting the width and height of the graphic target only,
    // using the actual file's dimensions is misleading
    this.width = 99;
    this.height = 65;
    this.x = 0;
    this.y = randomRow();
    this.speed = this.randomSpeed();
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    this.collisionTest();
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > 500) {
        // bug has passed canvas, let's randomly reset its row and speed
        this.x = -100;
        this.y = randomRow();
        this.speed = this.randomSpeed();
    }
    return this.x += this.speed * dt;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Called repeatedly from enemy.update to check
// for collisions with our player
Enemy.prototype.collisionTest = function () {
    if (itemsIntersect(this, player)) {
        player.loseLife();
        player.moveToStart();
    }
};

Enemy.prototype.randomSpeed = function () {
    // Randomly pick from slow, medium or fast
    var speeds = [50, 100, 200];
    // ... but increase speed slightly with each level
    return game.level * 20 + randomArrayVal(speeds);
};

// Player class
var Player = function () {
    this.sprite = 'images/char-cat-girl.png';
    // Setting the width and height of the graphic target only,
    // using the actual file's dimensions is misleading
    this.width = 67;
    this.height = 88;
    this.startX = 200;
    this.startY = 385;
    // These vals will update as the game plays
    this.x = this.startX;
    this.y = this.startY;
};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.moveToStart = function () {
    this.x = this.startX;
    this.y = this.startY;
};

Player.prototype.loseLife = function () {
    game.lives--;
    game.updateScoreBoard();

    if (game.lives === 0) {
        game.gameOver();
    }
};

Player.prototype.handleInput = function (key) {
    switch(key) {
        case 'right':
            if (this.x <= 350) {
                this.x += 100;
            }
            break;
        case 'left':
            if (this.x >= 100) {
                this.x -= 100;
            }
            break;
        case 'down':
            if (this.y <= 360) {
                this.y += 82;
            }
            break;
        case 'up':
            if (this.y <= 57) { // in water?
                this.loseLife();
                this.moveToStart();
            } else {
                this.y -= 82;
            }
            break;
    }
};

// Bonus class
// Superclass Inherited by gems and hearts
// Sets up some bonuses so that our player has a
// chance to gain lives, score points and level up
var Bonus = function () {
    // Setting the width and height of the graphic target only,
    // using the actual file's dimensions is misleading
    this.width = 61;
    this.height = 64;
    this.x = 0;
    this.y = randomRow();
};

Bonus.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Bonus.prototype.reset = function () {
    this.x = -this.width;
    this.y = randomRow();
};

Bonus.prototype.update = function (dt) {
    this.collisionTest();
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > 500) {
        // gem has passed canvas, let's randomly reset its row
        this.reset();
    }
    return this.x += this.speed * dt;
};

Bonus.prototype.collisionTest = function () {
    if (itemsIntersect(this, player)) {
        this.reset();
        game.scoreUp(this.points);
    }
};

// Setup types of bonuses as subclasses

var BlueGem = function () {
    Bonus.call(this);
    this.sprite = 'images/gem-blue.png';
    this.speed = 75;
    this.points = 5;
};
BlueGem.prototype.constructor = BlueGem;
BlueGem.prototype = Object.create(Bonus.prototype);

var OrangeGem = function () {
    Bonus.call(this);
    this.sprite = 'images/gem-orange.png';
    this.speed = 110;
    this.points = 10;
};
OrangeGem.prototype.constructor = OrangeGem;
OrangeGem.prototype = Object.create(Bonus.prototype);

var HeartGem = function () {
    Bonus.call(this);
    // Hearts should only happen on the first row
    // as an incentive for the player to get up there
    this.y = 55;
    this.sprite = 'images/heart.png';
    this.speed = 45;
};
HeartGem.prototype.constructor = HeartGem;
HeartGem.prototype = Object.create(Bonus.prototype);

// Hearts have their own update function
// since they don't randomize after a hit
HeartGem.prototype.update = function (dt) {
    this.collisionTest();
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x > 500) {
        this.x = -this.width;
    }
    return this.x += this.speed * dt;
};

// Hearts have their own collision test since the
// result is different (more lives not more points)
HeartGem.prototype.collisionTest = function () {
    if (itemsIntersect(this, player)) {
        this.x = -this.width;
        game.lives++;
        game.updateScoreBoard();
    }
};

// Set up a game!

var game = new Game();

var enemy0 = new Enemy();
var enemy1 = new Enemy();
var enemy2 = new Enemy();

var gem0 = new BlueGem();
var gem1 = new OrangeGem();
var gem2 = new HeartGem();

// Place all enemy objects in an array called allEnemies
var allEnemies = [enemy0, enemy1, enemy2];

// Place all bonus objects in an array called allBonuses
var allBonuses = [gem0, gem1, gem2];

// Place the player object in a variable called player
var player = new Player();

// This function is called by addEventListener
// and removeEventListener (when game starts and ends)
// to enable or disable player movements
function moveByKeys(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
}

game.start();
