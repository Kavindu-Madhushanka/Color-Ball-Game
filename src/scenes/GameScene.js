import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.coins = 1000;
    this.betAmount = 10;
    this.ballCount = 10;
  }

  preload() {
    // සවුන්ඩ් ෆයිල් ලෝඩ් කිරීම (ෆයිල් නැතිනම් console එකේ error එකක් ආවත් ගේම් එක පෙනේවි)
    // ඔයාගේ public/assets/ ෆෝල්ඩර් එකේ මේවා තියෙන්න ඕනේ
    this.load.audio("throw_snd", "assets/throw.mp3");
    this.load.audio("win_red", "assets/win_high.mp3");
    this.load.audio("win_blue", "assets/win_mid.mp3");
    this.load.audio("win_yellow", "assets/win_low.mp3");
    this.load.audio("lose_white", "assets/lose.mp3");
  }

  create() {
    const { width, height } = this.scale;

    // 1. Board සකස් කිරීම
    const boardWidth = 400;
    const boardHeight = 550;
    const boardX = width / 2;
    const boardY = height / 2 - 20;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    this.add
      .rectangle(boardX, boardY, boardWidth, boardHeight, 0x0e4d2a)
      .setStrokeStyle(8, 0x5d4037);

    this.physics.world.setBounds(
      boardX - boardWidth / 2,
      boardY - boardHeight / 2,
      boardWidth,
      boardHeight,
    );

    // 2. UI පෙන්වීම
    this.scoreText = this.add.text(20, 30, `COINS: ${this.coins}`, {
      fontSize: "22px",
      fill: "#f1c40f",
      fontStyle: "bold",
    });
    this.dollarText = this.add.text(
      20,
      60,
      `$${(this.coins / 100).toFixed(2)}`,
      { fontSize: "18px", fill: "#2ecc71" },
    );
    this.ballText = this.add
      .text(width - 20, 30, `BALLS: ${this.ballCount}`, {
        fontSize: "22px",
        fill: "#fff",
      })
      .setOrigin(1, 0);

    // 3. Honeycomb Holes Grid සැකසීම
    this.holes = this.physics.add.staticGroup();
    const rows = 8;
    const cols = 5;
    const spacingX = 72;
    const spacingY = 62;

    for (let r = 0; r < rows; r++) {
      let offsetX = r % 2 === 0 ? spacingX / 2.5 : 0;
      let redCol = Phaser.Math.Between(0, cols - 1);

      for (let c = 0; c < cols; c++) {
        let x = boardX - 165 + c * spacingX + offsetX;
        let y = boardY - 210 + r * spacingY;

        let color, mult, label;
        if (c === redCol) {
          color = 0xff0000;
          mult = 3;
          label = "x3";
        } else {
          let rand = Phaser.Math.Between(1, 100);
          if (rand <= 20) {
            color = 0x0000ff;
            mult = 2;
            label = "x2";
          } else if (rand <= 45) {
            color = 0xffff00;
            mult = 1;
            label = "x1";
          } else {
            color = 0xffffff;
            mult = 0;
            label = "x0";
          }
        }
        this.createHole(x, y, color, mult, label);
      }
    }

    // 4. බටන් සහ Bet Controls
    this.betText = this.add
      .text(width / 2, height - 180, `BET: ${this.betAmount}`, {
        fontSize: "20px",
        fill: "#fff",
      })
      .setOrigin(0.5);
    const btnStyle = {
      fontSize: "32px",
      fill: "#fff",
      backgroundColor: "#34495e",
      padding: 10,
    };
    this.add
      .text(width / 2 - 80, height - 180, "-", btnStyle)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.changeBet(-10));
    this.add
      .text(width / 2 + 50, height - 180, "+", btnStyle)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.changeBet(10));

    const throwBtn = this.add.container(width / 2, height - 100);
    const btnBg = this.add
      .rectangle(0, 0, 220, 70, 0xe67e22)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add
      .text(0, 0, "THROW BALL", {
        fontSize: "26px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    throwBtn.add([btnBg, btnTxt]);
    btnBg.on("pointerdown", () => this.throwBall());

    this.adBtn = this.add
      .text(width / 2, height - 30, "Watch Ad for +5 Balls", {
        fontSize: "16px",
        fill: "#3498db",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.adBtn.on("pointerdown", () => this.watchAd());
  }

  createHole(x, y, color, multiplier, label) {
    const hole = this.holes.create(x, y, null);
    hole.setCircle(22);
    hole.setVisible(false);
    this.add.circle(x, y, 22, color).setStrokeStyle(2, 0x000);
    this.add
      .text(x, y, label, { fontSize: "12px", fill: "#000", fontStyle: "bold" })
      .setOrigin(0.5);
    hole.multiplier = multiplier;
  }

  changeBet(amount) {
    if (
      this.betAmount + amount >= 10 &&
      this.betAmount + amount <= this.coins
    ) {
      this.betAmount += amount;
      this.betText.setText(`BET: ${this.betAmount}`);
    }
  }

  throwBall() {
    if (this.ballCount <= 0 || this.coins < this.betAmount) {
      if (this.ballCount <= 0) this.adBtn.setVisible(true);
      return;
    }

    // සවුන්ඩ් එක ඇත්නම් පමණක් ප්ලේ කිරීම
    if (this.sound.get("throw_snd")) this.sound.play("throw_snd");

    this.ballCount--;
    this.coins -= this.betAmount;
    this.updateUI();

    const ball = this.add.circle(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      10,
      0xffffff,
    );
    this.physics.add.existing(ball);
    ball.body.setCircle(10);
    ball.body.setCollideWorldBounds(true);
    ball.body.setBounce(0.8);
    ball.body.setVelocity(
      Phaser.Math.Between(-500, 500),
      Phaser.Math.Between(-600, -900),
    );
    ball.body.setDamping(true);
    ball.body.setDrag(0.96);

    this.time.delayedCall(3500, () => {
      if (ball.active) {
        ball.body.setVelocity(0, 0);
        this.checkHoleCollision(ball);
      }
    });
  }

  checkHoleCollision(ball) {
    let closestHole = null;
    let minDistance = 60;

    this.holes.getChildren().forEach((hole) => {
      const dist = Phaser.Math.Distance.Between(ball.x, ball.y, hole.x, hole.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestHole = hole;
      }
    });

    if (closestHole) {
      const winAmount = this.betAmount * closestHole.multiplier;
      this.coins += winAmount;

      // සිදුරේ පාට අනුව සද්දය ප්ලේ කිරීම
      this.playHoleSound(closestHole.multiplier);

      const winText = winAmount > 0 ? `+${winAmount}` : `LOSE!`;
      const textColor = winAmount > 0 ? "#f1c40f" : "#e74c3c";
      this.showWinText(closestHole.x, closestHole.y, winText, textColor);

      this.tweens.add({
        targets: ball,
        x: closestHole.x,
        y: closestHole.y,
        scale: 0.5,
        duration: 200,
        onComplete: () => {
          ball.destroy();
          this.updateUI();
        },
      });
    }
  }

  playHoleSound(mult) {
    let sndMap = {
      3: "win_red",
      2: "win_blue",
      1: "win_yellow",
      0: "lose_white",
    };
    let sndKey = sndMap[mult];
    if (this.sound.get(sndKey)) this.sound.play(sndKey);
  }

  showWinText(x, y, text, color) {
    const t = this.add
      .text(x, y - 50, text, {
        fontSize: "28px",
        fill: color,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => t.destroy(),
    });
  }

  updateUI() {
    this.scoreText.setText(`COINS: ${this.coins}`);
    this.dollarText.setText(`$${(this.coins / 100).toFixed(2)}`);
    this.ballText.setText(`BALLS: ${this.ballCount}`);
  }

  watchAd() {
    this.ballCount += 5;
    this.updateUI();
    this.adBtn.setVisible(false);
  }
}
