// Default vars
var level,
    score,
    lives,
    scoreWrap = document.getElementById('score');

var levelUp = function() {
    var levelWrap = document.getElementById('level'),
        oldLevel = parseInt(levelWrap.innerHTML);
    
    level = ++oldLevel;
    levelWrap.innerHTML = level;
}

var gameOver = function() {
    console.log('gameOver');
}

var loseLife = function() {
    var livesWrap = document.getElementById('lives');
        oldLives = parseInt(livesWrap.innerHTML);
    
    lives = --oldLives;
    livesWrap.innerHTML = lives;
    if(lives === 0) {
        gameOver();
    }
}

var collisionTest = function() {
    //console.log('test for collisions');
}

var randomArrayVal = function(arr) {
    // Randomly pick a value from an array
    randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

var randomSpeed = function() {
    // Randomly pick from slow, medium or fast
    var speeds = [55, 100, 200];
    return randomArrayVal(speeds);
}

var randomRow = function() {
    // Randomly pick y vals representing stone rows
    var rowPos = [60, 143, 225];
    return randomArrayVal(rowPos);
}

// Enemies our player must avoid
var Enemy = function(row) {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.width = 101;
    this.height = 171;
    this.x = 0;
    this.y = randomRow();
    this.speed = randomSpeed();
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    collisionTest();
    return this.x = this.x <= 500 ? this.x += this.speed * dt : this.x = -100;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.width = 101;
    this.height = 171;
    this.x = 200;
    this.y = 300;
}

Player.prototype.update = function(){
}

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(key){
    switch(key) {
        case 'right' :
            if(this.x <= 350) {
                this.x += 100;
            }
            break;
        case 'left' :
            if(this.x >= 100) {
                this.x -= 100;
            }
            break;
        case 'down' :
            if(this.y <= 300) {
                this.y += 82;
            }
            break;
        case 'up' :
            if(this.y < 55 ) { // in water?
                loseLife();
                this.y = 300;
            } else {
                this.y -= 82;
            }
            break;
    }
}

// Now instantiate your objects.
var enemy0 = new Enemy();
var enemy1 = new Enemy();
var enemy2 = new Enemy();

// Place all enemy objects in an array called allEnemies
var allEnemies = [enemy0, enemy1, enemy2];

// Place the player object in a variable called player

var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
