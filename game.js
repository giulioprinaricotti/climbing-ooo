class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.mountainImage = new Image();
        this.mountainImage.src = 'mountain.png';
        this.mountainLoaded = false;
        this.mountainImage.onload = () => {
            this.mountainLoaded = true;
        };
        
        this.goatImage = new Image();
        this.goatImage.src = 'goat.png';
        this.goatLoaded = false;
        this.goatImage.onload = () => {
            this.goatLoaded = true;
        };
        
        this.climberImage = new Image();
        this.climberImage.src = 'climber.png';
        this.climberLoaded = false;
        this.climberImage.onload = () => {
            this.climberLoaded = true;
        };
        
        this.bootImages = [];
        this.bootsLoaded = 0;
        for (let i = 1; i <= 5; i++) {
            const bootImage = new Image();
            bootImage.src = `boots_${i}.png`;
            bootImage.onload = () => {
                this.bootsLoaded++;
            };
            this.bootImages.push(bootImage);
        }
        
        this.rockImage = new Image();
        this.rockImage.src = 'rock.png';
        this.rockLoaded = false;
        this.rockImage.onload = () => {
            this.rockLoaded = true;
        };
        
        this.player = {
            x: this.width / 2 - 20,
            y: this.height - 200,
            width: 40,
            height: 50,
            speed: 5,
            color: '#FF6B35'
        };
        
        this.fallingObjects = [];
        this.score = 0;
        this.gameRunning = true;
        
        this.keys = {};
        this.scoreElement = document.getElementById('score');
        this.setupEventListeners();
        this.setupMobileControls();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    setupMobileControls() {
        const controlButtons = document.querySelectorAll('.control-btn');
        
        controlButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            // Touch start - simulate key press
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });
            
            // Touch end - simulate key release
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
            
            // Touch cancel - simulate key release
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
            
            // Mouse events for desktop testing
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys[key] = true;
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        
        // Spawn falling objects
        if (Math.random() < 0.02) {
            this.spawnFallingObject();
        }
        
        // Update falling objects
        this.fallingObjects.forEach((obj, index) => {
            obj.y += obj.speed;
            obj.rotation += obj.rotationSpeed;
            
            // Remove objects that have fallen off screen
            if (obj.y > this.height) {
                this.fallingObjects.splice(index, 1);
                this.score += 10;
                this.scoreElement.textContent = `Score: ${this.score}`;
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    spawnFallingObject() {
        const types = [
            { type: 'goat', color: '#F0E68C', emoji: '🐐', speed: 2 },
            { type: 'climber', color: '#87CEEB', emoji: '🧗‍♂️', speed: 1.5 },
            { type: 'boots', color: '#8B4513', emoji: '🥾', speed: 3 },
            { type: 'rock', color: '#696969', emoji: '🪨', speed: 2.5 }
        ];
        
        const objectType = types[Math.floor(Math.random() * types.length)];
        
        const obj = {
            x: Math.random() * (this.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: objectType.speed,
            color: objectType.color,
            emoji: objectType.emoji,
            type: objectType.type,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
        
        if (objectType.type === 'boots') {
            obj.bootIndex = Math.floor(Math.random() * 5);
        }
        
        this.fallingObjects.push(obj);
    }
    
    checkCollisions() {
        this.fallingObjects.forEach((obj, index) => {
            if (this.player.x < obj.x + obj.width &&
                this.player.x + this.player.width > obj.x &&
                this.player.y < obj.y + obj.height &&
                this.player.y + this.player.height > obj.y) {
                
                this.gameRunning = false;
            }
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw mountain wall texture
        if (this.mountainLoaded) {
            this.ctx.drawImage(this.mountainImage, 0, 0, this.width, this.height);
        } else {
            // Fallback mountain background pattern
            this.drawMountainBackground();
        }
        
        // Draw player (climber)
        if (this.climberLoaded) {
            this.ctx.drawImage(this.climberImage, this.player.x, this.player.y, this.player.width, this.player.height);
        } else {
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            this.ctx.font = '25px Arial';
            this.ctx.fillText('🧗‍♀️', this.player.x + 8, this.player.y + 30);
        }
        
        // Draw falling objects
        this.fallingObjects.forEach(obj => {
            this.ctx.save();
            this.ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            this.ctx.rotate(obj.rotation);
            
            if (obj.type === 'goat' && this.goatLoaded) {
                this.ctx.drawImage(this.goatImage, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            } else if (obj.type === 'climber' && this.climberLoaded) {
                this.ctx.drawImage(this.climberImage, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            } else if (obj.type === 'boots' && this.bootsLoaded === 5) {
                this.ctx.drawImage(this.bootImages[obj.bootIndex], -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            } else if (obj.type === 'rock' && this.rockLoaded) {
                this.ctx.drawImage(this.rockImage, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
            } else {
                this.ctx.fillStyle = obj.color;
                this.ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                this.ctx.font = '20px Arial';
                this.ctx.fillText(obj.emoji, -10, 5);
            }
            
            this.ctx.restore();
        });
        
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Draw game over screen
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#FF6B35';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.width / 2, this.height / 2 - 40);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2);
            this.ctx.fillText('Refresh to play again', this.width / 2, this.height / 2 + 40);
            
            this.ctx.textAlign = 'left';
        }
    }
    
    drawMountainBackground() {
        // Draw some simple mountain texture
        this.ctx.fillStyle = '#D2B48C';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Draw some cracks in the mountain
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * 120 + 50);
            this.ctx.lineTo(this.width, i * 120 + 80);
            this.ctx.stroke();
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});