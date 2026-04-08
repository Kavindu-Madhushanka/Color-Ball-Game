import Phaser from "phaser";
import HomeScene from "./scenes/HomeScene";
import GameScene from "./scenes/GameScene";
import "./style.css";

const config = {
  type: Phaser.AUTO,
  // මුල් අගයන් මෙතනම තිබීම ගැටලුවක් නැහැ, හැබැයි scale එක ඇතුළෙත් තියෙන්න ඕනේ
  width: 450,
  height: 800,
  parent: "app",
  backgroundColor: "#1a1a2e",

  // වැදගත්ම කොටස: මෙතන 'S' අකුර සිම්පල් 's' වෙන්න ඕනේ
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 450,
    height: 800,
  },

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [HomeScene, GameScene],
};

new Phaser.Game(config);
