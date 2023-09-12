import { BlockType, BlockTypes, Block } from "@minecraft/server";

//test set blockType

/*            // Create the permutation
            let bottomStoneSlab = MinecraftBlockTypes.stoneSlab.createDefaultBlockPermutation();
            bottomStoneSlab.getProperty(BlockProperties.stoneSlabType).value = "stone_brick";
            bottomStoneSlab.getProperty(BlockProperties.topSlotBit).value = false;
    
            // Set the permutation
            block.setPermutation(bottomStoneSlab);*/
export default class BlockMutate {
  typeId: BlockType;

  constructor(type: BlockType) {
    this.typeId = type;
  }

  copyFrom(sourceBlock: BlockMutate) {
    this.typeId = sourceBlock.typeId;
  }

  //change any block in the world, including empty air blocks, into whatever type you want
  mutateWorldBlock(block: Block) {
    if (this.typeId) {
      let sourceType = BlockTypes.get("minecraft:" + this.typeId);
      if (!sourceType) {
        console.log("Could not find type id " + this.typeId);
        return false;
      }
      block.setType(sourceType);
      return true;
    }
    return false;
  }
}
