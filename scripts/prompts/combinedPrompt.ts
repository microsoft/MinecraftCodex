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
// folllowEntity(entity: Entity, speed? : number): Promise<void> - Orders the simulated player to move to the given entity.
// mineBlock(blockArr : Block []) : boolean - simulated player mines a block and places it in their inventory
// collectNearbyItems() : number - Collects nearby items that may be on the ground - for example, mined ore
// interactBlock(blockArr: Block[]) : boolean - have the simulated player interact with a block, like a chest, table, forge, etc
// sortClosestBlock: (blocks: Block[]) : Block[] - sort the block array by which ones are closest to the simulated player
// transferItem(fromInventory: InventoryComponentContainer,toInventory: InventoryComponentContainer,name: string, numItems: number = -1): boolean
// canCraftItem(name: string) : boolean - does the simulated player have the inventory items to craft the requested item?
// craftItem(name: string) : void - craft the requested item from the simulated player's inventory
// state is an object where the simulated player should store its state.`,
  dialog: `// Move left
bot.moveRelative(1, 0, 1);

// Stop!
bot.stopMoving();

// What's up?
bot.chat("Not much! Just exploring the world.");

// Move backwards for half a second
bot.moveRelative(0, -1, 1);
await setTimeout(() => bot.stopMoving(), 500);

// A little more
bot.moveRelative(0, -1, 1);
setTimeout(() => bot.stopMoving(), 1000);

// Now right, but further
bot.moveRelative(-1, 0, 1);
await setTimeout(() => bot.stopMoving(), 2000);

//jump
bot.jumpUp();

//stop 
bot.stopMoving();

// collect nearby items 
await bot.collectNearbyItems();

//move diagonally left for three seconds
bot.moveRelative(-1, 1, 1)
setTimeout(() => { bot.stopMoving(); }, 3000);

//dance a jig
await setTimeout( ()=> bot.jumpUp(), 600);
await setTimeout( ()=> bot.jumpUp(), 600);
await setTimeout( ()=> bot.move(-1, 0, 1), 600);
await setTimeout( ()=> bot.stopMoving(), 1500);
await setTimeout( ()=> bot.jumpUp(), 1);
await setTimeout( ()=> bot.jumpUp(), 600);
await setTimeout( ()=> bot.move(1, 0, 1), 600);
await setTimeout( ()=> bot.stopMoving(), 1500);
await setTimeout( ()=> bot.jumpUp(), 1);
await setTimeout( ()=> bot.jumpUp(), 600);
await setTimeout( ()=> bot.stopMoving(), 600);

// good work!
bot.chat("Thanks!");

// Look at me
bot.lookAtEntity(target);

// Do that continuously
state.lookingInterval = setInterval(() => bot.lookAtEntity(target), 50);

// Stop it!
clearInterval(state.lookingInterval);

// Come to me
bot.navigateLocation(target.location, 0.7)

// look hither
bot.lookAtEntity(target);

// keep at it
state.lookingInterval = setInterval(() => bot.lookAtEntity(target), 50);

// u can stop
clearInterval(state.lookingInterval);

// follow me
state.followingInterval = setInterval(() => bot.followEntity(target, 0.7), 2000);

// stop following me!
clearInterval(state.followingInterval);

//where are you?
let loc = bot.getLocation();
bot.chat("I am at " + loc.x + ", " + loc.y + ", " + loc.z)

// list items in inventory
let inventory = game.listInventory(bot);
let haveItems = false;
for (let i = 0; i < inventory.size; i++) {
  let slotItem = inventory.getItem(i);
  if (slotItem != undefined) {
    let itemName = slotItem.id.substring(slotItem.id.indexOf(":") + 1, slotItem.id.length);
    let numItems = slotItem.amount;
    haveItems = true;

    bot.chat("I have " + numItems + " " + itemName);
  }
}
if(!haveItems) bot.chat("My inventory is empty");

//craft an oak_plank
bot.craftItem("oak_plank");

// can you craft an oak_plank
bot.canCraftItem("oak_plank");

// check to see if you can craft an oak_plank, and then build it
if(bot.canCraftItem("oak_plank")){
  bot.craftItem("oak_plank");
}
else 
{
  //find items for an oak plank and craft them
}

//find some grass
state.grassBlocks = bot.findBlock("grass", 16, 10);
await bot.navigateLocation(state.grassBlocks);
state.grassBlocks = bot.sortClosestBlock(state.grassBlocks);
bot.chat("What should I do with the grass?")

//mine two grass
state.grassBlocks = bot.findBlock("grass", 16, 2);
if(state.grassBlocks[0] != undefined)
{
  await bot.navigateLocation(state.grassBlocks);
  state.grassBlocks = bot.sortClosestBlock(state.grassBlocks);
  await bot.mineBlock(state.grassBlocks);
  await bot.mineBlock(state.grassBlocks);
  await bot.collectNearbyItems();
}

//get me grass
state.grassBlocks = bot.findBlock("grass", 16, 2);
await bot.navigateLocation(state.grassBlocks);
state.grassBlocks = bot.sortClosestBlock(state.grassBlocks);, 
await bot.mineBlock(state.grassBlocks);
await bot.collectNearbyItems();

//find and open a chest
state.chest = bot.findBlock("chest", 16, 1);
await bot.navigateLocation(state.chest);
bot.interactBlock(state.chest);

// tell me what is in the chest
let inventory = game.listInventory(state.chest[0]);
let haveItems = false;
for (let i = 0; i < inventory.size; i++) {
  let slotItem = inventory.getItem(i);
  if (slotItem != undefined) {
    let itemName = slotItem.id.substring(slotItem.id.indexOf(":"), slotItem.id.length);
    let numItems = slotItem.amount;
    haveItems = true;

    bot.chat("The chest has " + numItems + " " + itemName);
  }
}
if(!haveItems) bot.chat("The chest is empty");
`,
};
