import { world } from "mojang-minecraft";
import * as GameTest from "mojang-gametest";
import CodexGame from "./CodexGame.js";
import WebCommand from "./WebCommand.js";

let mainTickCount = 0;
let gameEnd = false;
export let game: CodexGame | null = null;

// main loop that drives the experience
function tickMain() {
  mainTickCount++;
  if (game) game.processTick();

  if (mainTickCount == 999999) {
    gameEnd = true;
  }
}

//register your game test start, which returns a GameTest object
GameTest.register("codex", "codex", (gameTest) => {
  const overworld = world.getDimension("overworld");

  //each tick is 50ms
  world.events.tick.subscribe(tickMain);

  game = new CodexGame(gameTest);

  overworld.runCommand("say Game Started");

  let commandApp = new WebCommand();
  commandApp.runThis();

  overworld.runCommand("say Web Command Listening");

  gameTest.succeedWhen(() => {
    gameTest.assert(gameEnd, "Game runs forever");
  });
})
  .maxTicks(800000)
  .structureName("codex:codex"); // load the structure file at structures/codex/codex.mcstructure

export function sendChat(message: string) {
  world.getDimension("overworld").runCommand("say " + message);
}
