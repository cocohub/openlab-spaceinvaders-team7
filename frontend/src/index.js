import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";
import { postLightFill, postLightScrollingText } from "./ledApi.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 600;

let background,
  playerBulletController,
  enemyBulletController,
  enemyController,
  player;

let scene = "menu";
let isSceneInitilized = false;

function pressButton(value, key) {
  value[key] = true;
  setTimeout(() => {
    value[key] = false;
  }, 10);
}

const buttonMap = {
  0: () => {
    console.log("X");
  },
  1: () => {
    console.log("A");
    pressButton(player, "shootPressed");
  },
  2: () => {
    console.log("B");
    scene = "win";
  },
  3: () => {
    console.log("Y");
  },
  4: () => {
    console.log("L");
    pressButton(player, "leftPressed");
  },
  5: () => {
    console.log("R");
    pressButton(player, "rightPressed");
  },
  8: () => {
    console.log("SELECT");
  },
  9: async () => {
    console.log("START");
    await postLightScrollingText({
      text: "GAME START",
      text_speed: 0.12,
      color: {
        r: 0,
        g: 255,
        b: 0,
      },
    });
    isSceneInitilized = false;
    scene = "level1";
  },
};

function gamepadController() {
  const gamepad = navigator.getGamepads()[0];
  if (gamepad) {
    gamepad.buttons
      .map((e) => e.pressed)
      .forEach((pressed, index) => {
        pressed && buttonMap[index] && buttonMap[index]();
        //console.log(pressed, index);
      });
  }
}

let hasSentStartRequest = false;
async function gameLoop() {
  gamepadController();

  // reset LED grid
  if (!hasSentStartRequest) {
    await postLightFill({ color: { r: 0, g: 0, b: 0 } });
    hasSentStartRequest = true;
  }
  switch (scene) {
    case "menu":
      if (!isSceneInitilized) initMenu();
      return sceneMenu();
    case "level1":
      if (!isSceneInitilized) initLevel1();
      return sceneLevel1();
    // case "level2":
    //   if (!isSceneInitilized) initLevel2();
    //   return level2();
    case "lose":
      return sceneGameOver();
    case "win":
      return sceneVictory();
  }
}

function initMenu() {
  background = new Image();
  background.src = "images/baren.png";
  background.onload = function () {
    isSceneInitilized = true;
  };
}
function initLevel1() {
  background = new Image();
  background.src = "images/baren.png";
  playerBulletController = new BulletController({
    canvas,
    maxBulletsAtATime: 10,
    bulletColor: "#96FA9D",
    soundEnabled: true,
  });
  enemyBulletController = new BulletController({
    canvas,
    maxBulletsAtATime: 4,
    bulletColor: "#FFFFFF",
    soundEnabled: false,
  });
  enemyController = new EnemyController({
    canvas,
    enemyBulletController,
    playerBulletController,
    moveDownTimerDefault: 30,
    fireBulletTimerDefault: 10,
    velocityX: 1,
    velocityY: 1,
  });
  player = new Player({
    canvas,
    velocity: 3,
    playerBulletController,
  });
  isSceneInitilized = true;
}

function sceneMenu() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Pingu's Bar", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "16px Arial";
  ctx.fillText("Press start.", canvas.width / 2, canvas.height / 2);

  function startGame() {
    canvas.removeEventListener("click", startGame);
    isSceneInitilized = false;
    scene = "level1";
  }

  canvas.addEventListener("click", startGame);
}

async function loseHealth() {
  player.health -= 1;
  shakeDuration = 5;

  await postLightFill({ color: { r: 255, g: 0, b: 0 } });
  setTimeout(async () => {
    await postLightFill({ color: { r: 0, g: 0, b: 0 } });
  }, 500);

  if (player.health <= 0) {
    scene = "lose";
  }
}

async function sceneLevel1() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  enemyController.draw(ctx);
  player.draw(ctx);
  playerBulletController.draw(ctx);
  enemyBulletController.draw(ctx);

  drawScore(enemyController.score);
  drawHp(player.health);

  if (enemyBulletController.collideWith(player)) {
    loseHealth();
  }
  if (enemyController.collideWith(player)) {
    loseHealth();
  }
  if (enemyController.enemyRows.length === 0) scene = "win";
  enemyController.scoreMultiplier = player.health;

  if (shakeDuration > 0) {
    preShake();
    shakeDuration--;
  } else {
    postShake();
  }
}

let isGameOverRun = false;
async function sceneGameOver() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "70px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", game.width / 2, game.height / 2 - 50);

  ctx.font = "50px Arial";

  ctx.fillText(
    "Tip $" + enemyController.score + "!",
    game.width / 2,
    game.height / 2 + 50
  );

  ctx.font = "30px Arial";
  ctx.fillText(
    "Press start to play again",
    game.width / 2,
    game.height / 2 + 130
  );

  if (!isGameOverRun) {
    setTimeout(async () => {
      await postLightScrollingText({
        text: "GAME OVER",
        text_speed: 0.12,
        color: {
          r: 255,
          g: 0,
          b: 0,
        },
      });
    }, 1000);

    isGameOverRun = true;
  }
}

function drawScore(score) {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("$" + score + " Tips", 10, 50);
}

function drawHp(score) {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(score + " hp", 50, canvas.height - 30);
}

function sceneVictory() {
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "70px Arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", game.width / 2, game.height / 2);
  ctx.fillText(
    "Tip $" + enemyController.score + "!",
    game.width / 2,
    game.height / 2 + 70
  );

  ctx.font = "30px Arial";
  ctx.fillText(
    "Press start to play again",
    game.width / 2,
    game.height / 2 + 130
  );
}

// use setInterval to update the game state
setInterval(gameLoop, 1000 / 60);

let shakeDuration = 0;

function preShake() {
  var dx = Math.random() * 10;
  var dy = Math.random() * 10;

  ctx.translate(dx, dy);
}

function postShake() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
