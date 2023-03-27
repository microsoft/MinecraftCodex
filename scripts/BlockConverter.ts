import { MinecraftBlockTypes, Block, BlockType, BlockProperties, BlockPermutation } from "@minecraft/server";

import { game } from "./main.js";

export class CodexBlockType {
  constructor(permutation: BlockPermutation | undefined, name: string) {
    this.permutation = permutation;
    this.name = name;
  }
  permutation: BlockPermutation | undefined = undefined;
  name: string = "";
}

export class BlockConverter {
  // some blocks need to be converted to the right type, so we either mutate the
  static ConvertBlockType(type: string): CodexBlockType {
    let subType: string = "";
    let blockConverter: BlockPermutation | undefined = undefined;
    let intPos: number = 0;
    let material: string = "";
    let baseType: string = "";

    intPos = type.indexOf("log");
    if (intPos >= 0) {
      subType = type.substring(0, intPos);
      baseType = "log";
      material = type.substring(0, type.indexOf("_"));
      switch (material) {
        case "oak":
        case "spruce":
        case "birch":
        case "jungle":
          blockConverter = BlockPermutation.resolve("minecraft:log", { old_log_type: material });
          break;

        case "acacia":
        case "dark_oak":
          blockConverter = BlockPermutation.resolve("minecraft:log2", { new_log_type: material });
          break;
      }
    }
    intPos = type.indexOf("wood");
    if (intPos < 0) intPos = type.indexOf("plank");

    if (intPos >= 0) {
      subType = type.substring(0, intPos);
      material = type.substring(0, type.indexOf("_"));
      baseType = "wood";

      switch (material) {
        case "oak":
        case "spruce":
        case "birch":
        case "jungle":
        case "acacia":
        case "dark_oak":
          blockConverter = BlockPermutation.resolve("minecraft:wood", { wood_type: material });
          break;
      }
    }
    intPos = type.indexOf("dirt");
    if (intPos >= 0) {
      subType = type.substring(0, intPos);
      baseType = "dirt";
      material = type.substring(0, type.indexOf("_"));

      switch (material) {
        case "coarse":
        case "normal":
          blockConverter = BlockPermutation.resolve("minecraft:dirt", { dirt_type: material });
          break;
      }
    }
    intPos = type.indexOf("sapling");
    if (intPos >= 0) {
      subType = type.substring(0, intPos);

      baseType = "sapling";
      material = type.substring(0, type.indexOf("_"));
      switch (material) {
        case "evergreen":
        case "birch":
        case "jungle":
        case "acacia":
        case "roofed_oak":
          blockConverter = BlockPermutation.resolve("minecraft:sapling", { sapling_type: material });
          break;
      }
    }
    intPos = type.indexOf("stone");
    if (intPos >= 0) {
      subType = type.substring(0, intPos);

      baseType = "stone";
      material = type.substring(0, type.indexOf("_"));
      switch (material) {
        case "stone":
        case "granite":
        case "granite_smooth":
        case "diorite":
        case "diorite_smooth":
        case "andesite":
        case "andesite_smooth":
          blockConverter = BlockPermutation.resolve("minecraft:stone", { stone_type: material });
          break;
      }
    }
    if (baseType === "") baseType = type;
    return new CodexBlockType(blockConverter, baseType);
  }
}
/**
 * String property that represents the type of certain types of
 * stone slab blocks. Valid values are 'smooth_stone',
 * 'sandstone', 'wood', 'cobblestone', 'brick', 'stone_brick',
 * 'quartz' and 'nether_brick'.
 */
// static readonly 'stoneSlabType' = 'stone_slab_type';
/**
 * String property that represents the type of certain types of
 * stone slab blocks. Valid values are 'red_sandstone',
 * 'purpur', 'prismarine_rough', 'prismarine_dark',
 * 'prismarine_brick', 'mossy_cobblestone', 'smooth_sandstone'
 * and 'red_nether_brick'.
 */
// static readonly 'stoneSlabType2' = 'stone_slab_type_2';
/**
 * String property that represents the type of certain types of
 * stone slab blocks. Valid values are 'end_stone_brick',
 * 'smooth_red_sandstone', 'polished_andesite', 'andesite',
 * 'diorite', 'polished_diorite', 'granite', and
 * 'polished_granite'.
 */
//static readonly 'stoneSlabType3' = 'stone_slab_type_3';
/**
 * String property that represents the type of certain types of
 * stone slab blocks. Valid values are 'mossy_stone_brick',
 * 'smooth_quartz', 'stone', 'cut_sandstone', and
 * 'cut_red_sandstone'.
 */
