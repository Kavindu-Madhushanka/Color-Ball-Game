import Phaser from "phaser";

export default class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    const { width, height } = this.scale;

    // 1. Modern Gradient Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x302b63, 0x24243e, 1);
    bg.fillRect(0, 0, width, height);

    // පස්සෙන් පේන අලංකාර රවුම් (Floating Orbs)
    this.add.circle(width * 0.2, height * 0.2, 80, 0x3498db, 0.1);
    this.add.circle(width * 0.8, height * 0.7, 120, 0xe74c3c, 0.1);

    // 2. Main Title (වැඩි දියුණු කළ අකුරු)
    const title = this.add
      .text(width / 2, height * 0.18, "BALL CASINO", {
        fontFamily: "Oswald, sans-serif",
        fontSize: "58px",
        fill: "#f1c40f",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 8,
        shadow: { blur: 15, color: "#f39c12", fill: true },
      })
      .setOrigin(0.5);

    // Title එකට පොඩි Animation එකක් (Up & Down)
    this.tweens.add({
      targets: title,
      y: height * 0.2,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 3. Info Text
    this.add
      .text(width / 2, height * 0.3, "PLAY & WIN EXCLUSIVE REWARDS", {
        fontFamily: "Poppins",
        fontSize: "16px",
        fill: "#ecf0f1",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // 4. Gift Cards Section (Modern Look)
    const cardContainer = this.add.container(width / 2, height * 0.45);

    // Amazon & Play icons (දැනට තියෙන ඒවාට වඩා පිරිසිදු පෙනුමක්)
    const amazon = this.add
      .text(-60, 0, "🅰️", { fontSize: "50px" })
      .setOrigin(0.5);
    const gPlay = this.add
      .text(60, 0, "🎮", { fontSize: "50px" })
      .setOrigin(0.5);

    const rewardTxt = this.add
      .text(0, 60, "WIN AMAZON & GOOGLE PLAY CARDS", {
        fontFamily: "Poppins",
        fontSize: "12px",
        fill: "#3498db",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    cardContainer.add([amazon, gPlay, rewardTxt]);

    // 5. Buttons (Modern Styled)
    this.createModernButton(
      width / 2,
      height * 0.65,
      "GUEST PLAY",
      0x2ecc71,
      () => {
        this.scene.start("GameScene");
      },
    );

    this.createModernButton(
      width / 2,
      height * 0.77,
      "REGISTER",
      0x3498db,
      () => {
        console.log("Register clicked");
      },
    );

    // 6. Footer Text
    this.add
      .text(width / 2, height * 0.92, "WIN BIG • REDEEM FAST • PLAY HARD", {
        fontFamily: "Oswald",
        fontSize: "14px",
        fill: "#7f8c8d",
        alpha: 0.7,
      })
      .setOrigin(0.5);
  }

  // Button එකක් ලස්සනට හදන function එක
  createModernButton(x, y, label, color, callback) {
    const btnContainer = this.add.container(x, y);

    // Button Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-115, -25, 240, 60, 12);

    // Button Base
    const btnBg = this.add.graphics();
    btnBg.fillGradientStyle(
      color,
      color,
      color - 0x111111,
      color - 0x111111,
      1,
    );
    btnBg.fillRoundedRect(-120, -30, 240, 60, 12);

    const btnText = this.add
      .text(0, 0, label, {
        fontFamily: "Oswald",
        fontSize: "24px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    btnContainer.add([shadow, btnBg, btnText]);

    // Button Interactions
    btnBg.setInteractive(
      new Phaser.Geom.Rectangle(-120, -30, 240, 60),
      Phaser.Geom.Rectangle.Contains,
    );

    btnBg.on("pointerover", () => {
      btnContainer.setScale(1.05);
      btnBg.setAlpha(0.9);
    });

    btnBg.on("pointerout", () => {
      btnContainer.setScale(1);
      btnBg.setAlpha(1);
    });

    btnBg.on("pointerdown", () => {
      btnContainer.setScale(0.95);
      this.time.delayedCall(100, callback);
    });
  }
}
