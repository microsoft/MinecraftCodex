import { DEBUG } from "./vars.js";
import {
  world,
  BlockLocation,
  Location,
  Vector,
  BlockRaycastOptions,
  Entity,
  Player,
  MinecraftBlockTypes,
  Block,
  BlockType,
  BlockProperties,
  StringBlockProperty,
  BlockPermutation,
  EntityQueryOptions,
} from "mojang-minecraft";

import { SimulatedPlayer } from "mojang-gametest";
import CodexGame from "./CodexGame.js";
import { game } from "./main.js";
import Crafting from "./Crafting.js";
import { BlockConverter, CodexBlockType } from "./BlockConverter.js";

export interface Bot extends SimulatedPlayer {
  chat: (message: string) => void;

  jumpUp: () => Promise<void>;

  getLocation: () => BlockLocation;
  navigateLocation: (worldLocation: Location, speed?: number) => Promise<void>;
  followEntity: (player: Entity, speed?: number) => Promise<void>;

  findBlock: (type: string, maxRadius: number) => Block[] | undefined;
  mineBlock: (block: Block[]) => Promise<boolean>;
  interactBlock: (block: Block) => boolean;
  sortClosestBlock: (blocks: Block[]) => Block[];

  canCraftItem: (name: string) => boolean;
  craftItem: (name: string) => void;
  collectNearbyItems: () => Promise<number>;
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

    this.simBot = thisGame.gameTest.spawnSimulatedPlayer(new BlockLocation(5, 0, 0), "steve") as Bot;
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
  }

  getLocation(): BlockLocation {
    return new BlockLocation(this.simBot.location.x, this.simBot.location.y, this.simBot.location.z);
  }

  chat(message: string) {
    this.simBot.runCommand("say " + message);
  }

  getRouteLength(locations: Location[]) {
    var totalLength = 0;

    for (let i = 1; i < locations.length; i++) {
      totalLength += this.getDistance(locations[i - 1], locations[i]);
    }

    return totalLength;
  }

  getDistance(start: Location, end: Location): number {
    let vector = new Vector(start.x - end.x, start.y - end.y, start.z - end.z);

    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  getBlockDistance(start: BlockLocation, end: BlockLocation): number {
    let vector = new Vector(start.x - end.x, start.y - end.y, start.z - end.z);

    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }

  sortClosestBlock(blocks: Block[]): Block[] {
    let loc = this.getLocation();
    blocks.sort((a, b) => {
      return this.getBlockDistance(a.location, loc) - this.getBlockDistance(b.location, loc);
    });

    return blocks;
  }

  lookBlock(blockLoc: BlockLocation) {
    let relBlockLoc = this.codexGame.gameTest.relativeBlockLocation(blockLoc);
    // make sure the bot is facing the block
    this.simBot.lookAtBlock(relBlockLoc);
  }

  async mineBlock(blockArr: Block[]): Promise<boolean> {
    let botHeadLoc = this.simBot.headLocation;
    let botLoc = this.simBot.location;

    let block = blockArr[0];
    let blockLoc = block.location;

    if (block === undefined) {
      this.chat("There are no blocks to mine");
      return false;
    }
    this.chat("Trying to mine!");

    // if the block is too high, find one that isn't
    while (blockLoc.y > botHeadLoc.y + 1) {
      this.chat("The block is too high, I can't reach it");
      blockArr.shift();
      block = blockArr[0];
      blockLoc = block.location;
    }

    // don't let the bot try to mine if its not near the block, wait until it has gotten to
    // it's destination to start mining
    if (this.getBlockDistance(blockLoc, new BlockLocation(botLoc.x, botLoc.y, botLoc.z)) > 3) {
      await this.navigateLocation(new Location(blockLoc.x, blockLoc.y, blockLoc.z), 0.7);
    }

    // make sure the bot is looking at what it is mining
    this.lookBlock(blockLoc);

    this.chat("Breaking block at " + blockLoc.x + "," + blockLoc.y + "," + blockLoc.z);
    let result = this.simBot.breakBlock(this.codexGame.gameTest.relativeBlockLocation(block.location));

    let overworld = world.getDimension("overworld");

    // is the block clear?
    for (let i = 0; i < 100; i++) {
      if (overworld.getBlock(block.location).isEmpty) {
        break;
      }

      await this.codexGame.taskStack.sleep(40);
    }

    blockArr.shift();
    blockArr = this.sortClosestBlock(blockArr);

    // this.chat("Mine result: " + result);

    return result;
  }

  interactBlock(block: Block): boolean {
    let blockLoc = block.location;

    // make sure the bot is facing the block
    this.lookBlock(blockLoc);

    let blockLocRel = this.codexGame.gameTest.relativeBlockLocation(blockLoc);
    return this.simBot.interactWithBlock(blockLocRel);
  }

  async collectNearbyItems(): Promise<number> {
    let eqo = new EntityQueryOptions();
    eqo.type = "minecraft:item";
    eqo.maxDistance = 10;
    eqo.location = this.simBot.location;

    let itemEntities = world.getDimension("overworld").getEntities(eqo);
    let locsToVisit: Location[] = [];

    for (let itemEntity of itemEntities) {
      locsToVisit.push(this.codexGame.gameTest.relativeLocation(itemEntity.location));
    }

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

    await this.codexGame.taskStack.sleep(distance * 200);

    return distance;
  }

  getPlayerByName(name: string): Player | undefined {
    for (let player of this.players) {
      if (player.name === name) {
        return player;
      }
    }

    return undefined;
  }

  async jumpUp() {
    this.simBot.jump();
    await this.codexGame.taskStack.sleep(400);
  }

  async navigateLocation(worldLocation: Location | BlockLocation, speed?: number) {
    if (!speed) {
      speed = 1;
    }
    let dest: Location = new Location(0, 0, 0);

    if (worldLocation instanceof BlockLocation) dest = new Location(worldLocation.x, worldLocation.y, worldLocation.z);

    if (worldLocation instanceof Location) dest = worldLocation;

    let botLoc = this.getLocation();
    let vector = new Location(dest.x - botLoc.x, dest.y - botLoc.y, dest.z - botLoc.z);
    let length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    let unitVec = new Location(vector.x / length, vector.y / length, vector.z / length);

    //magic number math
    let numPts = Math.ceil(length) + 1;
    numPts = Math.ceil(numPts / 2);

    let locations: Location[] = [];

    for (let i = 0; i < numPts; i++) {
      let point = new BlockLocation(botLoc.x + i * unitVec.x, botLoc.y + i * unitVec.y, botLoc.z + i * unitVec.z);
      let newPt = this.codexGame.gameTest.relativeBlockLocation(point);
      locations.push(new Location(newPt.x, newPt.y, newPt.z));
    }
    let lastBlockLoc = new BlockLocation(dest.x, dest.y, dest.z);
    let lastLoc = this.codexGame.gameTest.relativeBlockLocation(lastBlockLoc);
    locations.push(new Location(lastLoc.x - 0.5, lastLoc.y, lastLoc.z - 0.5));

    this.chat("Navigating to block " + numPts + " blocks long.");
    try {
      this.simBot.navigateToLocations(locations, speed);
    } catch (e) {
      this.simBot.chat("An error was thrown!");
    }

    // wait for a little bit for bot to start moving, then check position until done moving
    // we ignore the y position because it made sense when writing this code, could be a wrong choice
    do {
      await this.codexGame.taskStack.sleep(locations.length * 200 * (1 + (1 - speed)));
    } while (Math.abs(botLoc.x - lastLoc.x) <= 1 && Math.abs(botLoc.y - lastLoc.y) <= 1);

    this.chat("Done navigating!");
  }

  async followEntity(player: Entity, speed: number = 0.7) {
    let botBlockLoc = new BlockLocation(this.simBot.location.x, this.simBot.location.y, this.simBot.location.z);
    let playerBlockLoc = new BlockLocation(player.location.x, player.location.y, player.location.z);
    let distance = this.getBlockDistance(botBlockLoc, playerBlockLoc);

    this.simBot.navigateToEntity(player, speed);

    await this.codexGame.taskStack.sleep(distance * 200 * (1 + (1 - speed)));
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

  craftItem(name: string) {
    let output = Crafting.craft(this.simBot, name);
    this.chat(output);
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

  mirrorEven(x: number, y: number, z: number, start: BlockLocation, blocks: Block[], coreBlockType: string) {
    for (var i = 1; i >= 0; --i, x *= -1) {
      for (var j = 1; j >= 0; --j, y *= -1) {
        for (var k = 1; k >= 0; --k, z *= -1) {
          this.checkBlock(x + i, y + j, z + k, start, blocks, coreBlockType);
        }
      }
    }
  }
  mirrorOdd(x: number, y: number, z: number, start: BlockLocation, blocks: Block[], coreBlockType: string) {
    for (var i = 0; i < (x ? 2 : 1); ++i, x *= -1) {
      for (var j = 0; j < (y ? 2 : 1); ++j, y *= -1) {
        for (var k = 0; k < (z ? 2 : 1); ++k, z *= -1) {
          this.checkBlock(x, y, z, start, blocks, coreBlockType);
        }
      }
    }
  }
  checkBlock(x: number, y: number, z: number, start: BlockLocation, blocks: Block[], coreBlockType: string) {
    const loc = new BlockLocation(start.x + x, start.y + y, start.z + z);
    const block = game!.overWorld.getBlock(loc);
    if (block.type.id === coreBlockType) {
      blocks.push(block);
    }
  }

  // adapted from https://stackoverflow.com/questions/37214057/3d-array-traversal-originating-from-center
  findBlock(type: string, maxRadius: number = 16, numFind: number = 1): Block[] | undefined {
    let diameter = maxRadius * 2;
    const start = new BlockLocation(this.simBot.location.x, this.simBot.location.y, this.simBot.location.z);
    if (!game || !game.overWorld) {
      return undefined;
    }

    // we get better results if we have a larger pool of items to sort when we get close to the endpoint
    // so we always get at least 10, but some types are more limited, so do this on a per type basis
    if (type === "log") if (numFind < 10) numFind = 10;

    let codexBlockType = BlockConverter.ConvertBlockType(type);
    let coreBlockType = "minecraft:" + codexBlockType.name;

    let blocks: Block[] = [];

    var half = Math.ceil(diameter / 2) - 1;
    for (var d = 0; d <= 3 * half; d++) {
      for (var x = Math.max(0, d - 2 * half); x <= Math.min(half, d); x++) {
        for (var y = Math.max(0, d - x - half); y <= Math.min(half, d - x); y++) {
          diameter % 2
            ? this.mirrorOdd(x, y, d - x - y, start, blocks, coreBlockType)
            : this.mirrorEven(x, y, d - x - y, start, blocks, coreBlockType);

          if (blocks.length >= 10) {
            return blocks;
          }
        }
      }
    }

    if (blocks.length <= 0) return undefined;
    this.chat(`Found ${blocks.length} ${type} blocks`);
    return blocks;
  }
}
