import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "mojang-net";
import { game } from "./main.js";

// WebCommand Class

// used to get a command from local server app
// we do this because the Minecraft Bedrock terminal covers the entire screen
// so instead we have a small app in the minecraft-comms folder that can send
// text to the pack instead of sending text
export default class WebCommand {
  command: string = "";

  constructor() {
    this.command = "";
  }

  async runThis() {
    while (1) {
      if (game && game.player) {
        await this.getCommand().then(() => {
          if (this.command != "") {
            if (game && game.player) {
              game.player.runCommand("say " + this.command);
            }
          }
        });

        await game.taskStack.sleep(40);
      }
    }
  }

  async getCommand(): Promise<boolean> {
    const req = new HttpRequest("http://localhost:3000");

    req.headers = [new HttpHeader("Content-Type", "text/plain")];
    req.method = HttpRequestMethod.GET;

    const response = await http.request(req);

    console.log("response code: " + response);

    /*if (response.status >= 400) {
      throw new Error(`${response.status} ${response.statusText}`);
    }*/
    if (response) {
      this.command = response.body as any;
      if (this.command != "") {
        if (game && game.bot) {
          game.bot.chat("Command received: " + this.command);
          return true;
        }
      }
    }
    return false;
  }
}
