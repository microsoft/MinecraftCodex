import {
  BlockLocation,
  MinecraftBlockTypes,
  NavigationResult,
  BeforeChatEvent,
  world,
  Player,
  Dimension,
  Vector,
  Location,
  Block,
  InventoryComponentContainer,
  EntityInventoryComponent,
  ItemStack,
} from "mojang-minecraft";

import { CodexBot } from "./CodexBot.js";
import { BlockConverter, CodexBlockType } from "./BlockConverter.js";
import Prompt from "./Prompt.js";
import Model from "./Model.js";
import { context } from "./prompts/combinedPrompt.js";
import { SimulatedPlayer, Test } from "mojang-gametest";
import { GenGrow, BlockGen } from "./worldGrow/BoxGrow.js";
import { TimedQueue } from "./TimedQueue.js";
import { detectSensitiveContent } from "./ContentFilter.js";

let target = null;
let result = null;

class GameState {
  foundBlocks: Block[] | undefined = undefined;
  navResult: NavigationResult | undefined = undefined;
  followInterval: number = 0;

  constructor() {}
}

export default class CodexGame {
  gameTest: Test; // testing framework GameTest
  player: Player; // the player avatar
  bot: CodexBot; // our SimulatedPlayer bot
  overWorld: Dimension; // the game overworld, where most functions are run
  taskStack: TimedQueue = new TimedQueue(); // Used to support setInterval and clearInterval functions
  state: GameState = new GameState(); // A state bag for Codex code to set and get values
  model = new Model();
  prompt = new Prompt(context);
  genGrow = new GenGrow();

  constructor(test: Test) {
    this.setPlayer();

    this.player = Array.from(world.getPlayers())[0];

    this.gameTest = test;

    this.overWorld = world.getDimension("overworld");
    this.overWorld.runCommand("say Game Initialized, Codex running");

    // Spawn a new CodexBot instance, which wraps SimulatedPlayer, next to the main player
    this.bot = new CodexBot(this);

    world.events.beforeChat.subscribe((chat: BeforeChatEvent) => {
      this.processMessage(chat);
    });
  }

  // Update cycle for the behavior pack, process the taskStack which holds Promise chains
  processTick() {
    this.taskStack.processTick();
  }

  getInventory(object: Block | SimulatedPlayer | Player): InventoryComponentContainer | undefined {
    let container: InventoryComponentContainer | undefined = undefined;

    if (object instanceof SimulatedPlayer) {
      container = (object.getComponent("inventory") as EntityInventoryComponent).container;
    }

    if (object instanceof Block) {
      container = object.getComponent("inventory").container;
    }

    if (object instanceof Player) {
      container = (object.getComponent("inventory") as EntityInventoryComponent).container;
    }

    return container;
  }

  listInventory(object: Block | SimulatedPlayer | Player, name: string): InventoryComponentContainer | undefined {
    let container = this.getInventory(object);

    if (!container) return undefined;

    let haveItems = false;
    for (let i = 0; i < container.size; i++) {
      let slotItem = container.getItem(i);
      if (slotItem != undefined) {
        let itemName = slotItem.id.substring(slotItem.id.indexOf(":") + 1, slotItem.id.length);
        let numItems = slotItem.amount;
        haveItems = true;

        if (itemName != "") {
          // special case for bot inventory to be in first person
          if (name == "bot") {
            let response = "";
            response = "I have " + numItems + " " + itemName;
            if (numItems > 1 && !response.endsWith("s")) {
              response = response + "s";
            }
            this.bot.chat(response);
            this.prompt.addText(response);
          }
          // other inventories, like chests are second person
          else if (name != "") {
            let response = "The " + name + " has " + numItems + " " + itemName;
            if (numItems > 1) {
              response = response + "s";
            }
            this.bot.chat(response);
            this.prompt.addText(response);
          }
        }
      }
    }
    if (name != "" && !haveItems) {
      let response = "";
      if (name === "bot") response = "I have no items";
      else response = "The " + name + " is empty";
      this.bot.chat(response);
      this.prompt.addText(response);
    }

    return container;
  }

  transferItem(
    fromInventory: InventoryComponentContainer,
    toInventory: InventoryComponentContainer,
    name: string,
    numItems: number = -1
  ): boolean {
    let itemName = BlockConverter.ConvertBlockType(name).name;
    let slotItem: ItemStack;
    let fromSlot = -1;
    let toSlot = -1;
    itemName = "minecraft:" + itemName;

    for (let i = 0; i < fromInventory.size; i++) {
      slotItem = fromInventory.getItem(i);
      if (slotItem != undefined) {
        if (slotItem.id == itemName) {
          fromSlot = i;
          i = fromInventory.size;
        }
      }
    }

    for (let j = 0; j < toInventory.size; j++) {
      slotItem = toInventory.getItem(j);
      if (slotItem === undefined) {
        toSlot = j;
        j = toInventory.size;
      }
    }

    if (toSlot != -1 && fromSlot != -1) {
      let result = fromInventory.transferItem(fromSlot, toSlot, toInventory);
      return result;
    }
    this.bot.chat("The item isn't there");
    return false;
  }

  convertBlockLocToLoc(blockLoc: BlockLocation): Location {
    return new Location(blockLoc.x, blockLoc.y, blockLoc.z);
  }

  async pushGrowBlock(type: string, offsetX: number, offsetY: number, offsetZ: number) {
    this.genGrow.addBlock(MinecraftBlockTypes.get("minecraft:" + type), new Vector(offsetX, offsetY, offsetZ));
  }

  async growItem(location: Vector, offsetX: number, offsetY: number, offsetZ: number) {
    this.genGrow.applyToOverworld(new BlockLocation(location.x + offsetX, location.y + offsetY, location.z + offsetZ));
  }

  //check for the active player being set, and if hasn't been, then set it
  setPlayer() {
    if (!this.player) {
      let players = Array.from(world.getPlayers());

      this.player = players[0];
    }
  }

  recordEvent(channel: string, username: string, message: string) {
    console.log(channel + ": " + username + " says " + message + "\n");
  }

  recordException(err: any) {
    if (err.message) {
      console.warn("ERROR: " + err.message);
    } else console.warn("ERROR: " + err);
  }

  recordInteraction(eventName: string, userName: string, interaction: string, completion: string) {
    console.log("ACTION: " + eventName + "|" + userName + "|" + interaction + "|" + completion);
  }

  // Event subscriptions
  async processMessage(chat: BeforeChatEvent) {
    let username = chat.sender.name;
    const message = chat.message;
    const lcMessage = chat.message.toLowerCase();

    if (username === this.bot.getName()) return;
    if (lcMessage.startsWith("/")) return;

    if (lcMessage.startsWith("script ")) {
      this.evaluateCode(message.substring(7, message.length));
      return;
    }

    this.recordEvent("chat", username, message);

    if (lcMessage.startsWith("reset")) {
      this.recordEvent("reset", username, message);
      this.prompt.resetInteractions();
      this.bot.chat("I'm refreshed now!");
      return;
    }

    if (lcMessage.startsWith("unlearn")) {
      this.recordEvent("unlearn", username, message);
      this.prompt.removeLastInteraction();
      this.bot.chat("I unlearned our last interaction!");
      return;
    }

    let completion;
    let player = this.bot.getPlayerByName(username);

    if (!player) {
      return;
    }

    target = player;

    const prompt = this.prompt.craftPrompt(message);
    try {
      completion = await this.model.getCompletion(prompt);
    } catch (err: any) {
      this.recordException(err);
      console.log("Error calling Codex", err);

      if (err.message.includes("400")) {
        this.bot.chat("I had to reset my brain and might have forgotten some context. Sorry about that!");
        this.recordEvent("reset", username, message);
        this.prompt.resetInteractions();
      }
      return;
    }

    if (completion) {
      let sensitiveContentFlag = await detectSensitiveContent(message + "\n" + completion);
      // The flag can be 0, 1 or 2, corresponding to 'safe', 'sensitive' and 'unsafe'
      if (sensitiveContentFlag > 0) {
        console.warn(
          sensitiveContentFlag === 1
            ? "Your message or the model's response may have contained sensitive content."
            : "Your message or the model's response may have contained unsafe content."
        );
        this.bot.chat("Let's talk about something else");
        return;
      }

      // Appends the NL -> Code interaction onto our prompt for future turns
      this.prompt.addInteraction(message, completion);

      // Echoes code to chat window if it isn't already a chat command
      if (!completion.startsWith("bot.chat")) {
        this.bot.chat(completion);
      }

      await this.evaluateCode(completion);
    }
  }

  async evaluateCode(code: string, recursive = false) {
    try {
      await this.evaluate(code, {
        setTimeout: this.taskStack.setTimeout.bind(this.taskStack),
        sleep: this.taskStack.sleep.bind(this.taskStack),
        clearTimeout: this.taskStack.clearTimeout.bind(this.taskStack),
        setInterval: this.taskStack.setInterval.bind(this.taskStack),
        clearInterval: this.taskStack.clearInterval.bind(this.taskStack),
        game: this,
        state: this.state,
        bot: this.bot.simBot,
      });
    } catch (err) {
      this.handleError(err as Error);
      return false;
    }
  }

  /**
   * Allows us to pass args that the code eval will have access to
   * @param code code string to be evaluated
   * @param args context to pass to the eval scope
   * @returns
   */
  evaluate(code: string, args = {}) {
    return function evaluateEval() {
      const argsStr = Object.keys(args)
        .map((key) => `${key} = this.${key}`)
        .join(",");
      const argsDef = argsStr ? `let ${argsStr};` : "";

      return eval(`(async () => {${argsDef}${code}})();`);
    }.call(args);
  }

  handleError(err: Error) {
    this.recordException(err);
    console.log("Error evaluating code:", err);
    this.bot.chat(err.message);
    if (err.name !== "Error") {
      this.prompt.removeLastInteraction();
      this.bot.chat("I unlearned our last interaction!");
    }
  }
}
