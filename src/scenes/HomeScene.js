import Phaser from "phaser";

export default class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  // React වල preload වගේ Assets කලින් load කරගන්න තැන
  preload() {
    // ඇත්තම images නැති නිසා මම දැනට placeholder images පාවිච්චි කරනවා
    // පසුව ඔයා assets folder එකට දාන images වල path එක මෙතනට දෙන්න
    this.load.image("amazon", "https://img.icons8.com/color/96/amazon.png");
    this.load.image(
      "playstore",
      "https://img.icons8.com/color/96/google-play.png",
    );
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background (Dark Blue/Purple)
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // 2. Game Title
    const title = this.add
      .text(width / 2, 120, "BALL CASINO", {
        fontSize: "52px",
        fill: "#f1c40f",
        fontFamily: "Arial Black",
        stroke: "#000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    // Title Animation (React Framer Motion වගේ)
    this.tweens.add({
      targets: title,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // 3. Motivation Message
    const motivationMsg = "PLAY & COLLECT COINS TO WIN\nEXCLUSIVE GIFT BOXES!";
    this.add
      .text(width / 2, 230, motivationMsg, {
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 400 },
      })
      .setOrigin(0.5);

    // 4. Gift Cards Display Section
    const giftContainer = this.add.container(width / 2, 320);

    // Amazon & Playstore Icons
    const amazonImg = this.add.image(-70, 0, "amazon").setScale(0.8);
    const playImg = this.add.image(70, 0, "playstore").setScale(0.8);

    // "Win Cards" Text
    const giftText = this.add
      .text(0, 70, "WIN AMAZON & PLAY STORE CARDS", {
        fontSize: "14px",
        fill: "#00d2ff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    giftContainer.add([amazonImg, playImg, giftText]);

    // Gift Cards Animation
    this.tweens.add({
      targets: giftContainer,
      y: 330,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Power1",
    });

    // 5. Buttons (Reusable function එක භාවිතා කර)
    this.createMenuButton(width / 2, 480, "GUEST PLAY", 0x27ae60, () => {
      //console.log("Guest mode starting...");
      // this.scene.start('GameScene');
      this.scene.start("GameScene");
    });

    this.createMenuButton(width / 2, 570, "REGISTER", 0x2980b9, () => {
      this.handleRegister();
    });

    // 6. Footer Info
    this.add
      .text(width / 2, height - 30, "WIN BIG • REDEEM FAST • PLAY HARD", {
        fontSize: "12px",
        fill: "#7f8c8d",
      })
      .setOrigin(0.5);
  }

  // Button Component - React style එකට reusable කරලා තියෙන්නේ
  createMenuButton = (x, y, label, color, callback) => {
    const button = this.add.container(x, y);

    const bg = this.add
      .rectangle(0, 0, 300, 70, color)
      .setInteractive({ useHandCursor: true });

    const txt = this.add
      .text(0, 0, label, {
        fontSize: "26px",
        fill: "#fff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.add([bg, txt]);

    // Mouse Events (React onClick/onHover වගේ)
    bg.on("pointerover", () => {
      bg.setAlpha(0.8);
      button.setScale(1.05);
    });

    bg.on("pointerout", () => {
      bg.setAlpha(1);
      button.setScale(1);
    });

    bg.on("pointerdown", () => {
      button.setScale(0.95);
      callback();
    });
  };

  handleRegister = () => {
    console.log("Opening Registration...");
    alert("Register System is being connected to Firebase!");
  };
}
