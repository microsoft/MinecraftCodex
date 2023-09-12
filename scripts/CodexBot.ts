import { DEBUG } from "./vars.js";
import {
  world,
  Vector,
  BlockRaycastOptions,
  Entity,
  Player,
  Block,
  BlockType,
  BlockStates,
  BlockPermutation,
  EntityQueryOptions,
  EntityInventoryComponent,
  BlockRecordPlayerComponent,
  ItemStack,
  Vector3,
  Container,
} from "@minecraft/server";

import { SimulatedPlayer } from "@minecraft/server-gametest";
import CodexGame from "./CodexGame.js";
import { game } from "./main.js";
import Crafting from "./Crafting.js";
import { BlockConverter, CodexBlockType } from "./BlockConverter.js";

export interface Bot extends SimulatedPlayer {
  chat: (message: string) => void;

  jumpUp: () => Promise<void>;

  getLocation: () => Vector3;
  navigateLocation: (worldLocation: Vector3 | Block[], speed?: number) => Promise<void>;
  followEntity: (player: Entity, speed?: number) => Promise<void>;

  findBlock: (type: string, maxRadius: number) => Block[];
  mineBlock: (block: Block[]) => Promise<boolean>;
  interactBlock: (block: Block[]) => boolean;
  sortClosestBlock: (blocks: Block[]) => Block[];

  canCraftItem: (name: string) => boolean;
  craftItem: (name: string) => void;
  dropItem: (name: string) => boolean;
  placeItem: (name: string) => boolean;
  collectNearbyItems: () => Promise<number>;
  equipItem: (name: string) => boolean;
  transferItem: (fromInventory: Container, toInventory: Container, name: string, numItems: number) => boolean;

  inventory?: Container;
  targetInventory?: Container;
}

export class CodexBot {
  simBot: Bot; // the SimulatedPlayer that runs all the commands
  codexGame: CodexGame; // reference to the main class running the experience
  players: Player[] = []; // array of active players in the world
  name: string; // name of the main player character
  searchArray: Vector[] = [];

  constructor(thisGame: CodexGame) {
    this.codexGame = thisGame;

    this.players = Array.from(world.getPlayers());

    this.name = this.players[0].name;

    this.simBot = thisGame.gameTest.spawnSimulatedPlayer({ x: 5, y: 0, z: 0 }, "CodexBot") as Bot;
    this.simBot.chat = this.chat.bind(this);

    this.simBot.jumpUp = this.jumpUp.bind(this);

    this.simBot.getLocation = this.getLocation.bind(this);
    this.simBot.navigateLocation = this.navigateLocation.bind(this);
    this.simBot.followEntity = this.followEntity.bind(this);

    this.simBot.findBlock = this.findBlock.bind(this);
    this.simBot.mineBlock = this.mineBlock.bind(this);
    this.simBot.collectNearbyItems = this.collectNearbyItems.bind(this);
    this.simBot.interactBlock = this.interactBlock.bind(this);
    this.simBot.sortClosestBlock = this.sortClosestBlock.bind(this);

    this.simBot.canCraftItem = this.canCraftItem.bind(this);
    this.simBot.craftItem = this.craftItem.bind(this);
    this.simBot.transferItem = this.transferItem.bind(this);
    this.simBot.dropItem = this.dropItem.bind(this);
    this.simBot.equipItem = this.equipItem.bind(this);
    this.simBot.placeItem = this.placeItem.bind(this);
    this.simBot.inventory = this.simBot.inventory = (
      this.simBot.getComponent("inventory") as EntityInventoryComponent
    ).container;
    this.simBot.targetInventory = (this.players[0].getComponent("inventory") as EntityInventoryComponent).container;
  }

  chat(message: string) {
    this.simBot.runCommand("say " + message);
  }

  async jumpUp() {
    this.simBot.jump();
    await this.codexGame.taskStack.sleep(400);
  }

  getLocation(): Vector3 {
    return { x: this.simBot.location.x, y: this.simBot.location.y, z: this.simBot.location.z };
  }

  async navigateLocation(worldLocation: Vector3 | Block[], speed?: number) {
    if (!speed) {
      speed = 1;
    }
    let dest: Vector3 = { x: 0, y: 0, z: 0 };
    let blockArr: Block[] | undefined = undefined;

    if (!Array.isArray(worldLocation)) {
      dest = worldLocation as Vector3;
    } else {
      {
        blockArr = worldLocation as Block[];
        if (blockArr.length == 0) {
          this.chat("There is nowhere to go");
          return;
        }
        dest = { x: blockArr[0].location.x, y: blockArr[0].location.y, z: blockArr[0].location.z };
      }
    }

    let botLoc = this.getLocation();
    let vector = { x: dest.x - botLoc.x, y: dest.y - botLoc.y, z: dest.z - botLoc.z };
    let length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    let unitVec = { x: vector.x / length, y: vector.y / length, z: vector.z / length };

    //magic number math
    let numPts = Math.ceil(length) + 1;
    numPts = Math.ceil(numPts / 2);

    let locations: Vector3[] = [];

    for (let i = 0; i < numPts; i++) {
      let point = { x: botLoc.x + i * unitVec.x, y: botLoc.y + i * unitVec.y, z: botLoc.z + i * unitVec.z };
      let newPt = this.codexGame.gameTest.relativeBlockLocation(point);
      locations.push({ x: newPt.x, y: newPt.y, z: newPt.z });
    }
    let lastBlockLoc = { x: dest.x, y: dest.y, z: dest.z };
    let lastLoc = this.codexGame.gameTest.relativeBlockLocation(lastBlockLoc);

    let endOffset = { x: 0, y: 0, z: 0 };

    locations.push({ x: lastLoc.x - endOffset.x, y: lastLoc.y, z: lastLoc.z - endOffset.z });

    // this.chat("Navigating to block " + numPts + " blocks long.");
    try {
      this.simBot.navigateToLocations(locations, speed);
    } catch (e) {
      this.simBot.chat("An error was thrown!");
    }

    // wait for a little bit for bot to start moving, then check position until done moving
    // we ignore the y position because it made sense when writing this code, could be a wrong choice
    do {
      await this.codexGame.taskStack.sleep(locations.length * 200 * (1 + (1 - speed)));
    } while (this.getBlockDistance(this.codexGame.gameTest.relativeBlockLocation(this.getLocation()), lastLoc) > 2.5);

    if (blockArr != undefined) this.sortClosestBlock(worldLocation as Block[]);

    this.chat("Done navigating!");
  }

  async followEntity(player: Entity, speed: number = 0.7) {
    let botBlockLoc = { x: this.simBot.location.x, y: this.simBot.location.y, z: this.simBot.location.z };
    let playerBlockLoc = { x: player.location.x, y: player.location.y, z: player.location.z };
    let distance = this.getBlockDistance(botBlockLoc, playerBlockLoc);

    this.simBot.navigateToEntity(player, speed);

    await this.codexGame.taskStack.sleep(distance * 200 * (1 + (1 - speed)));
  }

  // adapted from https://stackoverflow.com/questions/37214057/3d-array-traversal-originating-from-center
  findBlock(type: string, maxRadius: number = 16, numFind: number = 1): Block[] {
    let diameter = maxRadius * 2;
    const start = { x: this.simBot.location.x, y: this.simBot.location.y, z: this.simBot.location.z };
    let blocks: Block[] = [];

    if (!game || !game.overWorld) {
      return blocks;
    }

    let codexBlockType = BlockConverter.ConvertBlockType(type);
    let coreBlockType = "minecraft:" + codexBlockType.name;

    // this.chat("The coreBlockType is " + coreBlockType);

    var half = Math.ceil(diameter / 2) - 1;
    for (var d = 0; d <= 3 * half; d++) {
      for (var x = Math.max(0, d - 2 * half); x <= Math.min(half, d); x++) {
        for (var y = Math.max(0, d - x - half); y <= Math.min(half, d - x); y++) {
          diameter % 2
            ? this.mirrorOdd(x, y, d - x - y, start, blocks, coreBlockType)
            : this.mirrorEven(x, y, d - x - y, start, blocks, coreBlockType);

          /* if (blocks.length >= 10) {
            return blocks;
          }*/
        }
      }
    }

    if (blocks.length <= 0) this.chat("I didn't find any blocks of type " + type);
    //  else this.chat(`Found ${blocks.length} ${type} blocks`);

    return blocks;
  }

  mirrorEven(x: number, y: number, z: number, start: Vector3, blocks: Block[], coreBlockType: string) {
    for (var i = 1; i >= 0; --i, x *= -1) {
      for (var j = 1; j >= 0; --j, y *= -1) {
        for (var k = 1; k >= 0; --k, z *= -1) {
          this.checkBlock(x + i, y + j, z + k, start, blocks, coreBlockType);
        }
      }
    }
  }

  mirrorOdd(x: number, y: number, z: number, start: Vector3, blocks: Block[], coreBlockType: string) {
    for (var i = 0; i < (x ? 2 : 1); ++i, x *= -1) {
      for (var j = 0; j < (y ? 2 : 1); ++j, y *= -1) {
        for (var k = 0; k < (z ? 2 : 1); ++k, z *= -1) {
          this.checkBlock(x, y, z, start, blocks, coreBlockType);
        }
      }
    }
  }
  checkBlock(x: number, y: number, z: number, start: Vector3, blocks: Block[], coreBlockType: string) {
    const loc = { x: start.x + x, y: start.y + y, z: start.z + z };
    const block = game!.overWorld.getBlock(loc);

    // adding this check sped up the search by factor of 10
    if (!block || block.typeId === "minecraft:air") return;

    if (block.type.id === coreBlockType) {
      blocks.push(block);
    }
  }

  async mineBlock(blockArr: Block[]): Promise<boolean> {
    let botHeadLoc = this.simBot.getHeadLocation();
    let botLoc = this.simBot.location;

    if (blockArr === undefined || blockArr.length === 0) {
      let output = "There is nothing here to mine";
      this.chat(output);
      game?.prompt.addText(output);
      return false;
    }

    let block = blockArr[0];
    let blockLoc = block.location;

    //  this.chat("Trying to mine!");

    // if the block is too high, find one that isn't
    while (blockLoc.y > botHeadLoc.y + 1) {
      //this.chat("The block is too high, I can't reach it");
      blockArr.shift();
      block = blockArr[0];
      if (block === undefined) return false;

      blockLoc = block.location;
    }

    // go towards the block we are trying to mine
    await this.navigateLocation({ x: blockLoc.x, y: blockLoc.y, z: blockLoc.z }, 0.7);

    // make sure the bot is looking at what it is mining
    this.lookBlock(blockLoc);

    this.chat("Breaking block at " + blockLoc.x + "," + blockLoc.y + "," + blockLoc.z);
    let result = this.simBot.breakBlock(this.codexGame.gameTest.relativeBlockLocation(block.location));

    let overworld = world.getDimension("overworld");

    // is the block clear?
    for (let i = 0; i < 100; i++) {
      const blockInstance = overworld.getBlock(block.location);
      if (blockInstance && blockInstance.typeId === "minecraft:air") {
        break;
      }

      await this.codexGame.taskStack.sleep(40);
    }

    blockArr.shift();
    blockArr = this.sortClosestBlock(blockArr);

    return result;
  }

  lookBlock(blockLoc: Vector3) {
    let relBlockLoc = this.codexGame.gameTest.relativeBlockLocation(blockLoc);
    // make sure the bot is facing the block
    this.simBot.lookAtBlock(relBlockLoc);
  }

  // the API always works on the first block in the array
  interactBlock(blockArr: Block[]): boolean {
    if (blockArr === undefined || blockArr.length === 0) {
      this.chat("There is nothing to interact with");
      return false;
    }

    let blockLoc = blockArr[0].location;

    // make sure the bot is facing the block
    this.lookBlock(blockLoc);

    let blockLocRel = this.codexGame.gameTest.relativeBlockLocation(blockLoc);
    return this.simBot.interactWithBlock(blockLocRel);
  }

  async collectNearbyItems(): Promise<number> {
    let eqo = {
      type: "minecraft:item",
      maxDistance: 10,
      location: this.simBot.location,
    };

    let itemEntities = world.getDimension("overworld").getEntities(eqo);
    let locsToVisit: Vector3[] = [];

    for (let itemEntity of itemEntities) {
      locsToVisit.push(this.codexGame.gameTest.relativeLocation(itemEntity.location));
    }

    let chatOut = "I am picking up " + locsToVisit.length + " block";

    if (locsToVisit.length > 1) chatOut += "s";
    this.chat(chatOut);

    if (locsToVisit.length === 0) {
      this.chat(
        "I couldn't find any items near " +
          this.simBot.location.x +
          ", " +
          this.simBot.location.y +
          ", " +
          +this.simBot.location.z
      );

      return 0;
    }

    this.simBot.navigateToLocations(locsToVisit, 1);

    let distance = this.getRouteLength(locsToVisit);

    let lastLoc = locsToVisit[locsToVisit.length - 1];
    let blockLastLoc = { x: lastLoc.x, y: lastLoc.y, z: lastLoc.z };

    do {
      await this.codexGame.taskStack.sleep(locsToVisit.length * 500);
    } while (
      this.getBlockDistance(this.codexGame.gameTest.relativeBlockLocation(this.getLocation()), blockLastLoc) > 1.5
    );

    return distance;
  }

  dropItem(name: string): boolean {
    let inventory = this.codexGame.getInventory(this.simBot);
    let slotItem: ItemStack | undefined = undefined;
    let slotLoc = 0;

    if (!inventory) return false;

    let fullName = "minecraft:" + name;
    //  this.chat("The item to drop is " + fullName);

    for (let i = 0; i < inventory.size; i++) {
      slotItem = inventory.getItem(i);
      if (slotItem != undefined) {
        if (slotItem.typeId === fullName) {
          //  this.chat("Found the item to drop!");
          slotLoc = i;
          let loc = this.simBot.location;
          let result = this.simBot.useItemInSlotOnBlock(slotLoc, { x: loc.x + 1, y: loc.y, z: loc.z + 1 });
          // this.chat("Result is " + result);
          return result;
        }
      }
    }
    return false;
  }

  placeItem(name: string): boolean {
    let inventory = this.codexGame.getInventory(this.simBot);
    let slotItem: ItemStack | undefined = undefined;

    if (!inventory) return false;

    let fullName = "minecraft:" + name;
    let loc = this.getLocation();

    if (!game) return false;

    let block: Block | undefined = game.overWorld.getBlock(loc);

    if (block) {
      for (let i = 0; i < inventory.size; i++) {
        slotItem = inventory.getItem(i);
        if (slotItem != undefined) {
          if (slotItem.typeId === fullName) {
            // Create the permutation
            let torch = BlockPermutation.resolve("minecraft:torch");
            // Set the permutation
            block.setPermutation(torch);
            return true;
          }
        }
      }
    }

    return false;
  }

  transferItem(fromInventory: Container, toInventory: Container, name: string, numItems: number): boolean {
    if (!game) return false;
    return game?.transferItem(fromInventory, toInventory, name, numItems);
  }

  equipItem(name: string) {
    let itemName = BlockConverter.ConvertBlockType(name).name;
    let slotItem: ItemStack | undefined;
    itemName = "minecraft:" + itemName;
    let inventory = this.simBot.inventory;
    let slotLoc = 0;

    //  this.chat("Inventory is " + inventory + " And item name is " + itemName);

    if (!inventory) return false;

    for (let i = 0; i < inventory.size; i++) {
      slotItem = inventory.getItem(i);
      if (slotItem != undefined) {
        if (slotItem.typeId == itemName) {
          let loc = this.simBot.location;
          let result = this.simBot.useItemInSlot(i);
          this.chat("Result is " + result);
          return result;
        }
      }
    }

    return false;
  }

  sortClosestBlock(blocks: Block[]): Block[] {
    if (blocks && blocks.length > 0) {
      let loc = this.getLocation();
      blocks.sort((a, b) => {
        return this.getBlockDistance(a.location, loc) - this.getBlockDistance(b.location, loc);
      });
    }

    return blocks;
  }

  craftItem(name: string) {
    let output = Crafting.craft(this.simBot, name);
    this.chat(output);
    game?.prompt.addText(output);
  }

  canCraftItem(name: string) {
    if (Crafting.canCraft(this.simBot, name)) {
      this.chat("I can make a " + name);
      return true;
    } else {
      this.chat("I don't have the items I need to make the " + name);
      return false;
    }
  }

  getRouteLength(locations: Vector3[]) {
    var totalLength = 0;

    for (let i = 1; i < locations.length; i++) {
      totalLength += this.getDistance(locations[i - 1], locations[i]);
    }

    return totalLength;
  }

  getDistance(start: Vector3, end: Vector3): number {
    let vector = new Vector(start.x - end.x, start.y - end.y, start.z - end.z);

    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  getBlockDistance(start: Vector3, end: Vector3): number {
    let vector = new Vector(start.x - end.x, start.y - end.y, start.z - end.z);

    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  getPlayerByName(name: string): Player | undefined {
    for (let player of this.players) {
      if (player.name === name) {
        return player;
      }
    }

    return undefined;
  }

  getName() {
    return this.simBot.name;
  }

  getPlayerName() {
    return this.name;
  }

  _log(m: string) {
    if (DEBUG) this.simBot.runCommand("say " + m);
  }
}
