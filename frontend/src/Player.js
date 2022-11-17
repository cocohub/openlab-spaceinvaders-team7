export default class Player {
  rightPressed = false;
  leftPressed = false;
  shootPressed = false;
  health = 3;

  constructor({ canvas, velocity, playerBulletController }) {
    this.canvas = canvas;
    this.velocity = velocity;
    this.bulletController = playerBulletController;

    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 75;
    this.width = 200;
    this.height = 200;
    this.image = new Image();
    this.image.src = "images/pingu_the_bartender.png";

    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  }

  draw(ctx) {
    if (this.shootPressed) {
      this.bulletController.shoot(this.x + this.width / 2, this.y, 4, 10);
    }
    this.move();
    this.collideWithWalls();
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  collideWithWalls() {
    //left
    if (this.x < 0) {
      this.x = 0;
    }

    //right
    if (this.x > this.canvas.width - this.width) {
      this.x = this.canvas.width - this.width;
    }
  }

  move() {
    if (this.rightPressed) {
      this.x += this.velocity;
    } else if (this.leftPressed) {
      this.x += -this.velocity;
    }
  }

  keydown = (event) => {
    if (event.code == "ArrowRight") {
      this.rightPressed = true;
    }
    if (event.code == "ArrowLeft") {
      this.leftPressed = true;
    }
    if (event.code == "Space") {
      this.shootPressed = true;
    }
  };

  keyup = (event) => {
    if (event.code == "ArrowRight") {
      this.rightPressed = false;
    }
    if (event.code == "ArrowLeft") {
      this.leftPressed = false;
    }
    if (event.code == "Space") {
      this.shootPressed = false;
    }
  };
}
