import { system, world } from "@minecraft/server";
import * as GameTest from "@minecraft/server-gametest";
import CodexGame from "./CodexGame.js";

let mainTickCount = 0;
let gameEnd = false;
export let game: CodexGame | null = null;

// main loop that drives the experience
function tickMain() {
  mainTickCount++;

  try {
    if (game) game.processTick();

    // we need some arbitrary flag to say when the game should 'end' even though we never do
    if (mainTickCount == 999999) {
      gameEnd = true;
    }
  } catch (e) {}

  system.run(tickMain);
}

//register your game test start, which returns a GameTest object
// this is what creates teh structure in the world that acts as the origin for the simulatedplayer
// and creates the box with the button to restart GameTest
GameTest.register("codex", "codex", (gameTest) => {
  const overworld = world.getDimension("overworld");

  //each tick is 50ms
  system.run(tickMain);

  game = new CodexGame(gameTest);

  overworld.runCommand("say Game Started");

  overworld.runCommand("say Web Command Listening");

  gameTest.succeedWhen(() => {
    gameTest.assert(gameEnd, "Game runs forever");
  });
})
  .maxTicks(800000) // run the code forever
  .structureName("codex:codex"); // load the structure file at structures/codex/codex.mcstructure
