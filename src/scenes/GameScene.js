import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.coins = 1000;
    this.betAmount = 10;
    this.ballCount = 10;
    this.playerName = "PLAYER 01";
    // 1,000,000 Coins = $1.00 Ratio
    this.coinToDollar = 1000000;
  }

  preload() {
    this.load.audio("throw_snd", "assets/throw.mp3");
    this.load.audio("win_high", "assets/win_high.mp3");
    this.load.audio("win_low", "assets/win_low.mp3");
    this.load.audio("lose", "assets/lose.mp3");
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x111122, 0x111122, 1);
    bg.fillRect(0, 0, width, height);

    // Game Board Setup
    const boardWidth = 400;
    const boardHeight = 450;
    const boardX = width / 2;
    const boardY = height / 2 - 80;

    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x0e4d2a, 0.95);
    boardBg.fillRoundedRect(
      boardX - boardWidth / 2,
      boardY - boardHeight / 2,
      boardWidth,
      boardHeight,
      15,
    );
    boardBg.lineStyle(4, 0xbdc3c7, 1);
    boardBg.strokeRoundedRect(
      boardX - boardWidth / 2,
      boardY - boardHeight / 2,
      boardWidth,
      boardHeight,
      15,
    );

    this.physics.world.setBounds(
      boardX - boardWidth / 2,
      boardY - boardHeight / 2,
      boardWidth,
      boardHeight,
    );

    // --- UI UPDATES ---

    // 2. Coins ලොකුවට සහ $ අගය කුඩාවට පෙන්වීම
    this.add.text(20, 20, this.playerName, {
      fontFamily: "Oswald",
      fontSize: "16px",
      fill: "#3498db",
    });

    // Coins (Large)
    this.dollarText = this.add.text(20, 40, `${this.coins} COINS`, {
      fontFamily: "Poppins",
      fontSize: "28px",
      fill: "#f1c40f",
      fontStyle: "bold",
    });

    // Dollar Value (Small - 1,000,000 = $1 ratio)
    this.scoreText = this.add.text(
      20,
      75,
      `$${(this.coins / this.coinToDollar).toFixed(2)}`,
      {
        fontFamily: "Poppins",
        fontSize: "16px",
        fill: "#bdc3c7",
      },
    );

    // 1. Ball count එක ළඟ "BALLS" ලෙස text එකක් එක් කිරීම
    this.ballTextContainer = this.add.container(width - 70, 50);
    const ballCircle = this.add
      .circle(0, 0, 35, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xffffff, 0.3);

    this.ballLabel = this.add
      .text(0, -15, "BALLS", {
        fontFamily: "Oswald",
        fontSize: "12px",
        fill: "#bdc3c7",
      })
      .setOrigin(0.5);

    this.ballText = this.add
      .text(0, 10, `${this.ballCount}`, {
        fontFamily: "Poppins",
        fontSize: "24px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.ballTextContainer.add([ballCircle, this.ballLabel, this.ballText]);

    // Holes Grid
    this.holes = this.physics.add.staticGroup();
    this.setupStyledHoles(boardX, boardY);

    // Bottom Controls
    const controlStartY = height - 230;
    this.betText = this.add
      .text(width / 2, controlStartY, `BET: ${this.betAmount}`, {
        fontFamily: "Oswald",
        fontSize: "28px",
        fill: "#f1c40f",
      })
      .setOrigin(0.5);

    this.btnMinus = this.add
      .text(width / 2 - 120, controlStartY, "-", {
        fontSize: "32px",
        fill: "#fff",
        backgroundColor: "#34495e",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.btnPlus = this.add
      .text(width / 2 + 120, controlStartY, "+", {
        fontSize: "32px",
        fill: "#fff",
        backgroundColor: "#34495e",
        padding: 15,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.btnMinus.on("pointerdown", () => this.changeBet(-10));
    this.btnPlus.on("pointerdown", () => this.changeBet(10));

    // Throw Button
    const throwBtn = this.add.container(width / 2, height - 130);
    const btnThrowBg = this.add
      .graphics()
      .fillGradientStyle(0xff9f43, 0xff9f43, 0xee5253, 0xee5253, 1)
      .fillRoundedRect(-120, -35, 240, 70, 15);
    btnThrowBg.setInteractive(
      new Phaser.Geom.Rectangle(-120, -35, 240, 70),
      Phaser.Geom.Rectangle.Contains,
    );
    const btnTxt = this.add
      .text(0, 0, "THROW BALL", {
        fontFamily: "Oswald",
        fontSize: "28px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    throwBtn.add([btnThrowBg, btnTxt]);

    btnThrowBg.on("pointerdown", () => {
      this.tweens.add({
        targets: throwBtn,
        scale: 0.95,
        duration: 50,
        yoyo: true,
      });
      this.throwBall();
    });

    this.setupBottomOptions(width, height);
    this.setupMessagePopup(width, height);
  }

  // 4. Ball Tail Effect එක සඳහා විශේෂ ලොජික් එක
  throwBall() {
    if (this.ballCount <= 0) {
      this.adMsgContainer.setVisible(true);
      return;
    }
    if (this.coins < this.betAmount) {
      this.adMsgContainer
        .getAt(2)
        .setText("NOT ENOUGH COINS!\nWatch for +10,000 Coins?");
      this.adMsgContainer.setVisible(true);
      return;
    }

    if (this.sound.get("throw_snd")) this.sound.play("throw_snd");

    this.ballCount--;
    this.coins -= this.betAmount;
    this.updateUI();

    const ball = this.add.circle(
      this.scale.width / 2,
      this.scale.height / 2 + 150,
      11,
      0xffffff,
    );
    this.physics.add.existing(ball);
    ball.body
      .setCircle(11)
      .setCollideWorldBounds(true)
      .setBounce(0.9)
      .setVelocity(
        Phaser.Math.Between(-500, 500),
        Phaser.Math.Between(-800, -1100),
      )
      .setDamping(true)
      .setDrag(0.96);

    // Tail (Trail) Effect එක නිර්මාණය කිරීම
    const trailParticles = this.add.graphics();
    const trailPoints = [];

    const trailTimer = this.time.addEvent({
      delay: 20,
      callback: () => {
        if (!ball.active) {
          trailTimer.remove();
          trailParticles.destroy();
          return;
        }

        trailPoints.push({ x: ball.x, y: ball.y, alpha: 0.6 });
        if (trailPoints.length > 10) trailPoints.shift();

        trailParticles.clear();
        trailPoints.forEach((p, index) => {
          p.alpha -= 0.05;
          trailParticles.fillStyle(0xffffff, p.alpha);
          trailParticles.fillCircle(
            p.x,
            p.y,
            11 * (index / trailPoints.length),
          );
        });
      },
      loop: true,
    });

    this.time.delayedCall(3800, () => {
      if (ball.active) {
        ball.body.setVelocity(0, 0);
        this.checkHoleCollision(ball);
      }
    });
  }

  setupStyledHoles(boardX, boardY) {
    const rows = 7;
    const cols = 5;
    const spX = 72;
    const spY = 56;
    for (let r = 0; r < rows; r++) {
      let offsetX = r % 2 === 0 ? spX / 2.5 : 0;
      let rowColors = [
        { c: 0xff3333, m: 3, l: "x3", g: 0xff0000 },
        { c: 0x33ccff, m: 2, l: "x2", g: 0x00ffff },
        { c: 0xffdd00, m: 1, l: "x1", g: 0xffff00 },
        { c: 0xffffff, m: 0, l: "x0", g: 0xffffff },
        { c: 0xffffff, m: 0, l: "x0", g: 0xffffff },
      ];
      Phaser.Utils.Array.Shuffle(rowColors);
      for (let c = 0; c < cols; c++) {
        let x = boardX - 165 + c * spX + offsetX;
        let y = boardY - 165 + r * spY;
        let data = rowColors[c];
        this.createStyledHole(x, y, data.c, data.m, data.l, data.g);
      }
    }
  }

  createStyledHole(x, y, color, multiplier, label, glowColor) {
    this.add.circle(x, y, 25, glowColor, 0.15);
    this.add.graphics().lineStyle(3, color, 1).strokeCircle(x, y, 23);
    this.add
      .text(x, y, label, {
        fontFamily: "Poppins",
        fontSize: "12px",
        fill: color,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const hole = this.holes.create(x, y, null);
    hole.setCircle(23).setVisible(false);
    hole.multiplier = multiplier;
    hole.colorStyle = color;
  }

  updateUI() {
    // 3. 1,000,000 = $1 Ratio එක අනුව Update කිරීම
    this.scoreText.setText(`$${(this.coins / this.coinToDollar).toFixed(2)}`);
    this.dollarText.setText(`${this.coins} COINS`);
    this.ballText.setText(`${this.ballCount}`);
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

  checkHoleCollision(ball) {
    let closestHole = null;
    let minDistance = 50;
    this.holes.getChildren().forEach((h) => {
      const d = Phaser.Math.Distance.Between(ball.x, ball.y, h.x, h.y);
      if (d < minDistance) {
        minDistance = d;
        closestHole = h;
      }
    });

    if (closestHole) {
      const win = this.betAmount * closestHole.multiplier;
      this.coins += win; // සල්ලි එකතු කිරීම
      this.playHoleSound(closestHole.multiplier);
      this.showWinText(
        closestHole.x,
        closestHole.y,
        win > 0 ? `+${win}` : "LOST!",
        win > 0 ? closestHole.colorStyle : "#e74c3c",
      );

      this.tweens.add({
        targets: ball,
        x: closestHole.x,
        y: closestHole.y,
        scale: 0.4,
        duration: 200,
        onComplete: () => {
          ball.destroy();
          // මෙන්න මෙතනදී updateUI() එකට call කිරීමෙන් බෝලය සිදුරට වැටුණු ගමන්ම සල්ලි පෙනේවි
          this.updateUI();
        },
      });
    } else {
      ball.destroy();
    }
  }
  playHoleSound(m) {
    const s = m === 3 ? "win_high" : m >= 1 ? "win_low" : "lose";
    if (this.sound.get(s)) this.sound.play(s);
  }

  showWinText(x, y, txt, col) {
    const t = this.add
      .text(x, y - 40, txt, {
        fontFamily: "Oswald",
        fontSize: "30px",
        fill: col,
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

  setupBottomOptions(w, h) {
    const style = { fontFamily: "Oswald", fontSize: "13px", fill: "#7f8c8d" };
    this.add.text(w * 0.2, h - 40, "⚙️ SETTINGS", style).setOrigin(0.5);
    this.add.text(w * 0.5, h - 40, "🏆 LEADERBOARD", style).setOrigin(0.5);
    this.add.text(w * 0.8, h - 40, "🎁 GIFT BOX", style).setOrigin(0.5);
  }

  setupMessagePopup(w, h) {
    this.adMsgContainer = this.add
      .container(w / 2, h / 2)
      .setVisible(false)
      .setDepth(1000);
    const overlay = this.add
      .graphics()
      .fillStyle(0x000000, 0.7)
      .fillRect(-w / 2, -h / 2, w, h);
    const box = this.add
      .graphics()
      .fillStyle(0x1a1a2e, 1)
      .fillRoundedRect(-150, -80, 300, 160, 15)
      .lineStyle(2, 0xffffff, 0.2)
      .strokeRoundedRect(-150, -80, 300, 160, 15);
    const txt = this.add
      .text(0, -20, "OUT OF BALLS!\nWatch for +5 Balls?", {
        fontFamily: "Poppins",
        fontSize: "16px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);
    const btn = this.add
      .text(0, 40, "WATCH NOW", {
        backgroundColor: "#2ecc71",
        padding: 10,
        fontFamily: "Oswald",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.adMsgContainer.setVisible(false);
      this.ballCount += 5;
      this.coins += 10000;
      this.updateUI();
    });
    this.adMsgContainer.add([overlay, box, txt, btn]);
  }
}
