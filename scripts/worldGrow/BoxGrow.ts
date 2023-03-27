import { Block, MinecraftBlockTypes, Vector, Vector3, world } from "@minecraft/server";
import BlockBounds from "./BlockBounds.js";
import BlockMutate from "./BlockGrow.js";

export const MAX_TIME_CONSUMPTION_MS = 10;

export class BlockGen {
  blockType: MinecraftBlockTypes;
  blockMutator: BlockMutate;
  offset: Vector;

  constructor(blockType: MinecraftBlockTypes, offset: Vector) {
    this.blockType = blockType;
    this.blockMutator = new BlockMutate(blockType);
    this.offset = offset;
  }
}

export class GenGrow {
  blocksToGrow: BlockGen[] = [];

  addBlock(blockType: MinecraftBlockTypes, offset: Vector) {
    this.blocksToGrow.push(new BlockGen(blockType, offset));
  }

  applyToOverworld(location: Vector3) {
    const overworld = world.getDimension("overworld");
    let posX = location.x;
    let posY = location.y;
    let posZ = location.z;
    let blocksApplied = 0;

    for (let growBlock of this.blocksToGrow) {
      let offset = growBlock.offset;
      let worldBlock = overworld.getBlock({ x: posX + offset.x, y: posY + offset.y, z: posZ + offset.z });
      growBlock.blockMutator.mutateWorldBlock(worldBlock);
      blocksApplied++;
    }
    this.blocksToGrow.length = 0;
    return blocksApplied;
  }
}

class BoxGrow {
  boxSize: BlockBounds;
  blockType: MinecraftBlockTypes;
  blockMutator: BlockMutate;

  constructor(size: BlockBounds, blockType: MinecraftBlockTypes) {
    this.boxSize = size;
    this.blockType = blockType;
    this.blockMutator = new BlockMutate(blockType);
  }

  render() {
    const start = new Date();
    let featuresRendered = 0;
    const now = new Date();
    const timeInterval = now.getTime() - start.getTime();

    //limit the amount of time we can take in the render loop before we yield back
    if (timeInterval >= MAX_TIME_CONSUMPTION_MS) {
      return;
    }
  }

  applyToOverworld(location: Vector3) {
    const overworld = world.getDimension("overworld");
    let sX = location.x;
    let sY = location.y;
    let sZ = location.z;
    let blocksApplied = 0;

    for (let iX = 0; iX < this.boxSize.x; iX++) {
      for (let iY = 0; iY < this.boxSize.y; iY++) {
        for (let iZ = 0; iZ < this.boxSize.z; iZ++) {
          let worldBlock = overworld.getBlock({ x: sX + iX, y: sY + iY, z: sZ + iZ });
          this.blockMutator.mutateWorldBlock(worldBlock);
          blocksApplied++;
        }
      }
    }
    return blocksApplied;
  }
}
