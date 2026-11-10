import Phaser from "phaser";
import { Backdrop, fadeToScene } from "./backdrop.ts";
import type { Hud } from "../hud.ts";
import type { LaunchOptions } from "../main.ts";
import { SECTORS } from "../route.ts";
import { HEIGHT, WIDTH } from "../actors.ts";

const IDLE_SECONDS = 8;

export class TitleScene extends Phaser.Scene {
  private backdrop!: Backdrop;
  private countdown!: Phaser.GameObjects.Text;
  private idle = 0;
  private leaving = false;

  constructor(
    private readonly hud: Hud,
    private readonly options: LaunchOptions,
  ) {
    super("title");
  }

  init(): void {
    this.idle = 0;
    this.leaving = false;
  }

  create(): void {
    this.backdrop = new Backdrop(this);

    this.hud.setMode("title");
    this.hud.setRoute(SECTORS.map((sector) => sector.name));
    this.hud.setSector(-1);
    this.hud.setBoss(null);
    this.hud.say("");

    const title = this.add.text(WIDTH / 2, HEIGHT * 0.34, "NEON\nWARDEN", {
      fontFamily: "Orbitron, Trebuchet MS, sans-serif",
      fontSize: "64px",
      fontStyle: "bold",
      align: "center",
      color: "#e8fdff",
    }).setOrigin(0.5).setLineSpacing(-6);

    title.enableFilters();
    title.filters?.internal.addGlow(0x5ef2ff, 6, 0, 1);

    this.tweens.add({
      targets: title,
      scale: 1.04,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.add.text(WIDTH / 2, HEIGHT * 0.62, "SPACE  launch", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffe066",
    }).setOrigin(0.5);

    this.countdown = this.add.text(WIDTH / 2, HEIGHT * 0.68, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#8aa4c8",
    }).setOrigin(0.5);

    const onSpace = () => this.launchPlay(false);

    this.input.keyboard?.on("keydown-SPACE", onSpace);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off("keydown-SPACE", onSpace);
    });

    this.cameras.main.fadeIn(400, 4, 2, 12);

    if (this.options.attract) {
      this.launchPlay(true);
    }
  }

  override update(_time: number, delta: number): void {
    this.backdrop.scroll(delta);

    if (this.leaving) return;

    this.idle += delta / 1000;
    const left = Math.ceil(IDLE_SECONDS - this.idle);

    this.countdown.setText(`self-play demo in ${left}`);

    if (left <= 0) {
      this.launchPlay(true);
    }
  }

  private launchPlay(attract: boolean): void {
    if (this.leaving) return;

    this.leaving = true;
    fadeToScene(this, "play", { attract });
  }
}
