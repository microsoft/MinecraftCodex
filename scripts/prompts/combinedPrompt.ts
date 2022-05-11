import { Context } from "../Prompt.js";

// This context offers the model examples of how to use the SimulatedPlayer API to look at the player, go to the player and follow the player.
export let context: Context = {
  background: `//Minecraft bot commands When the comment is conversational, the bot will respond as a helpful minecraft bot. Otherwise, it will do as asked.`,
  apiDoc: `// API REFERENCE:
// moveRelative(leftRight: number, backwardForward: number, speed?: number): void - Orders the simulated player to walk in the given direction relative to the player's current rotation.
// stopMoving(): void - Stops moving/walking/following if the simulated player is moving.
// lookAtEntity(entity: Entity): void - Rotates the simulated player's head/body to look at the given entity.
// jumpUp(): boolean - Causes the simulated player to jump.
// chat(message: string): void - Sends a chat message from the simulated player.
// listInventory(object: Block | SimulatedPlayer | Player): InventoryComponentContainer - returns a container enumerating all the items a player or treasure chest has
// getLocation() : BlockLocation - returns the location from the simulated player
// navigateLocation(worldLocation: Location : Block, speed?: number) : Promise<NavigationResult> - path find through the world to a location
// findBlock(type: string, maxRadius: number, numFind : number = 1): Block [] - Returns the an arry of blocks closest to the simulated player of the type given within the radius.
// followEntity(entity: Entity, speed? : number): Promise<void> - Orders the simulated player to move to the given entity.
// mineBlock(blockArr : Block []) : boolean - simulated player mines a block and places it in their inventory
// collectNearbyItems() : number - Collects nearby items that may be on the ground - for example, mined ore
// placeItem(name: string): boolean - Places an inventory item of the same name on the ground, if the bot has the item
// interactBlock(blockArr: Block[]) : boolean - have the simulated player interact with a block, like a chest, table, forge, etc
// sortClosestBlock: (blocks: Block[]) : Block[] - sort the block array by which ones are closest to the simulated player
// transferItem(fromInventory: InventoryComponentContainer,toInventory: InventoryComponentContainer,name: string, numItems: number = -1): boolean
// canCraftItem(name: string) : boolean - does the simulated player have the inventory items to craft the requested item?
// craftItem(name: string) : void - craft the requested item from the simulated player's inventory
// equipItem(name: string) : boolean - equip the named item in the bot's hand from it's inventory
// state is an object where the simulated player should store its state.`,
  dialog: `// Move left
bot.moveRelative(1, 0, 1);

// Stop!
bot.stopMoving();

// Move backwards for half a second
bot.moveRelative(0, -1, 1);
await setTimeout(() => bot.stopMoving(), 500);

// Now right, but further
bot.moveRelative(-1, 0, 1);
await setTimeout(() => bot.stopMoving(), 2000);

//jump
bot.jumpUp();

//stop 
bot.stopMoving();

// collect nearby items 
await bot.collectNearbyItems();

// good work!
bot.chat("Thanks!");

// What's up?
bot.chat("Not much! Just exploring the world.");

// Look at me
bot.lookAtEntity(target);

// Do that continuously
state.lookingInterval = setInterval(() => bot.lookAtEntity(target), 50);

// Stop it!
clearInterval(state.lookingInterval);

// Come to me
bot.navigateLocation(target.location, 0.7)

// follow me
state.followingInterval = setInterval(() => bot.followEntity(target, 0.7), 2000);

// stop following me!
clearInterval(state.followingInterval);

//where are you?
let loc = bot.getLocation();
bot.chat("I am at " + loc.x + ", " + loc.y + ", " + loc.z)

// list items in your inventory
let inventory = game.listInventory(bot, "bot");

{
  itemToCraft: "furnace",
  ingredients: {
  "cobblestone": {
      quantity: 8
    },
  },
  result: {
    numberCreated: 1,
  },
},
{
  itemToCraft: "planks",
  ingredients: {
  "log": {
      quantity: 1
    },
  },
  result: {
    numberCreated: 4,
  },
},
{
  itemToCraft: "chest",
  ingredients: {
  "planks": {
      quantity: 8
    },
  },
  result: {
    numberCreated: 1,
  },
},
{
  itemToCraft: "stick",
  ingredients: {
  "log": {
      quantity: 1
    },
  },
  result: {
    numberCreated: 4,
  },
},

//craft an oak_plank
bot.craftItem("plank");

// can you craft an oak_plank
bot.canCraftItem("plank");

//find some grass
state.grassBlocks = bot.findBlock("grass", 16, 100);
await bot.navigateLocation(state.grassBlocks);
bot.chat("What should I do with the grass?")

//mine two grass
await bot.mineBlock(state.grassBlocks);
await bot.mineBlock(state.grassBlocks);
await bot.collectNearbyItems();

// look hither
bot.lookAtEntity(target);

// keep at it
state.lookingInterval = setInterval(() => bot.lookAtEntity(target), 50);

// u can stop
clearInterval(state.lookingInterval);

//go get me grass
state.grassBlocks = bot.findBlock("grass", 16, 2);
await bot.navigateLocation(state.grassBlocks);
await bot.mineBlock(state.grassBlocks);
await.bot.mineBlock(state.grassBlocks);
await bot.collectNearbyItems();
bot.chat("I have mined and collected 2 grass");

//get me the ingredients needed to build a chest
state.log = bot.findBlock("log", 16, 2);
await bot.mineBlock(state.log);
await bot.mineBlock(state.log);
await bot.collectNearbyItems();
bot.craftItem("planks");
bot.craftItem("planks");

// make me the sword
bot.craftItem("planks");
bot.craftItem("stick");
bot.craftItem("wooden_sword");

//find and open a chest
state.chest = bot.findBlock("chest", 16, 1);
await bot.navigateLocation(state.chest);
if(bot.interactBlock(state.chest)) bot.chat("I have opened the chest")

// tell me what is in the chest
let inventory = game.listInventory(state.chest[0], "chest");

// bring the logs here and put on the ground
let loc = target.location;
bot.navigateLocation(new Location(loc.x+2.5, loc.y, loc.z+2.5));
if(bot.dropItem("log")) bot.chat("I have brought you the logs");


//what items are needed to build planks?
bot.chat("We need 1 log to build 4 planks);
`,
};
