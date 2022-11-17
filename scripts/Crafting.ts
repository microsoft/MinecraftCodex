import { Player, EntityInventoryComponent, ItemStack, Items, MinecraftItemTypes, ItemTypes } from "@minecraft/server";
import IRecipe from "./IRecipe.js";

export default class Crafting {
  constructor() {}

  static getRecipe(identifier: string) {
    identifier = identifier.toLowerCase();

    if (identifier.indexOf(":") <= 0) {
      identifier = "minecraft:" + identifier;
    }

    for (let recipe of this.recipes) {
      if (recipe.description && recipe.description.identifier === identifier) {
        return recipe;
      }
    }

    return undefined;
  }

  static canCraft(player: Player, recipeId: string): boolean {
    let recipe = this.getRecipe(recipeId);

    if (!recipe) {
      return false;
    }

    let ingredients = this.getFlatIngredientList(recipe);

    let playerInventoryContainer = (player.getComponent("inventory") as EntityInventoryComponent).container;

    for (let i = 0; i < playerInventoryContainer.size; i++) {
      let slotItem = playerInventoryContainer.getItem(i);

      if (slotItem) {
        if (ingredients[slotItem.typeId]) {
          ingredients[slotItem.typeId] -= slotItem.amount;

          if (ingredients[slotItem.typeId] < 0) {
            ingredients[slotItem.typeId] = 0;
          }
        }
      }
    }

    // do we have any leftover ingredients that haven't been found in the inventory?
    for (let ingredientId in ingredients) {
      let ing = ingredients[ingredientId];

      if (ing > 0) {
        return false;
      }
    }

    return true;
  }

  static craft(player: Player, recipeId: string): string {
    let recipe = this.getRecipe(recipeId);

    if (!recipe) {
      //  throw new Error("Could not find recipe '" + recipeId + "'");
      return "Sorry, I don't have that recipe";
    }

    if (!this.canCraft(player, recipeId)) {
      //  throw new Error("Could not craft recipe '" + recipeId + "' - player does not have ingredients");
      return "I don't have those ingredients";
    }

    let ingredients = this.getFlatIngredientList(recipe);

    let playerInventoryContainer = (player.getComponent("inventory") as EntityInventoryComponent).container;

    for (let i = 0; i < playerInventoryContainer.size; i++) {
      let slotItem = playerInventoryContainer.getItem(i);

      if (slotItem && ingredients[slotItem.typeId]) {
        if (slotItem.amount > ingredients[slotItem.typeId]) {
          slotItem.amount -= ingredients[slotItem.typeId];
          playerInventoryContainer.setItem(i, slotItem);
          ingredients[slotItem.typeId] = 0;
        } else if (slotItem.amount == ingredients[slotItem.typeId]) {
          playerInventoryContainer.setItem(i, new ItemStack(ItemTypes.get("air"), 1));
          ingredients[slotItem.typeId] = 0;
        } else if (slotItem.amount < ingredients[slotItem.typeId]) {
          ingredients[slotItem.typeId] -= slotItem.amount;
          playerInventoryContainer.setItem(i, new ItemStack(ItemTypes.get("air"), 1));
        }
      }
    }
    //console.warn("Giving player a " + recipe.result.item);
    let count = recipe.result.count ? recipe.result.count : 1;
    let data = recipe.result.data ? recipe.result.data : 0;

    playerInventoryContainer.addItem(new ItemStack(Items.get(recipe.result.item), count, data));
    return "I made the " + recipeId + "!";
  }

  static getFlatIngredientList(recipe: IRecipe) {
    let pattern = recipe.pattern;
    let results: { [ingredient: string]: number } = {};

    for (let recipeLine of pattern) {
      for (let c of recipeLine) {
        let ingredient = recipe.key[c];

        if (ingredient) {
          if (results[ingredient.item]) {
            results[ingredient.item]++;
          } else {
            results[ingredient.item] = 1;
          }
        }
      }
    }

    return results;
  }

  //BlockProperties, BlockType, MincraftBlockTypes, MinecraftItemTypes

  static recipes: IRecipe[] = [
    {
      description: {
        identifier: "minecraft:planks",
      },
      tags: [""],
      pattern: ["#"],
      key: {
        "#": {
          item: "minecraft:log",
          data: 0,
        },
      },
      result: {
        item: "minecraft:planks",
        data: 0,
        count: 4,
      },
    },
    {
      description: {
        identifier: "minecraft:acacia_boat",
      },
      tags: ["crafting_table"],
      pattern: ["#P#", "###"],
      key: {
        P: {
          item: "minecraft:wooden_shovel",
        },
        "#": {
          item: "minecraft:planks",
          data: 4,
        },
      },
      result: {
        item: "minecraft:boat",
        data: 4,
      },
    },
    {
      description: {
        identifier: "minecraft:acacia_door",
      },

      tags: ["crafting_table"],
      group: "wooden_door",
      pattern: ["##", "##", "##"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 4,
        },
      },
      result: {
        item: "minecraft:acacia_door",
        count: 3,
      },
    },
    {
      description: {
        identifier: "minecraft:acacia_fence_gate",
      },

      tags: ["crafting_table"],
      group: "wooden_fence_gate",
      pattern: ["#W#", "#W#"],
      key: {
        "#": {
          item: "minecraft:stick",
        },
        W: {
          item: "minecraft:planks",
          data: 4,
        },
      },
      result: {
        item: "minecraft:acacia_fence_gate",
      },
    },
    {
      description: {
        identifier: "minecraft:acacia_stairs",
      },

      tags: ["crafting_table"],
      group: "wooden_stairs",
      pattern: ["#  ", "## ", "###"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 4,
        },
      },
      result: {
        item: "minecraft:acacia_stairs",
        count: 4,
      },
    },
    {
      description: {
        identifier: "minecraft:anvil",
      },

      tags: ["crafting_table"],
      pattern: ["III", " i ", "iii"],
      key: {
        I: {
          item: "minecraft:iron_block",
        },
        i: {
          item: "minecraft:iron_ingot",
        },
      },
      result: {
        item: "minecraft:anvil",
        data: 0,
      },
    },
    {
      description: {
        identifier: "minecraft:beacon",
      },

      tags: ["crafting_table"],
      pattern: ["GGG", "GSG", "OOO"],
      key: {
        S: {
          item: "minecraft:netherstar",
        },
        G: {
          item: "minecraft:glass",
        },
        O: {
          item: "minecraft:obsidian",
        },
      },
      result: {
        item: "minecraft:beacon",
      },
    },
    {
      description: {
        identifier: "minecraft:boat",
      },

      tags: ["crafting_table"],
      pattern: ["#P#", "###"],
      key: {
        P: {
          item: "minecraft:wooden_shovel",
        },
        "#": {
          item: "minecraft:planks",
          data: 0,
        },
      },
      result: {
        item: "minecraft:boat",
        data: 0,
      },
    },
    {
      description: {
        identifier: "minecraft:bow",
      },

      tags: ["crafting_table"],
      pattern: [" #X", "# X", " #X"],
      key: {
        "#": {
          item: "minecraft:stick",
        },
        X: {
          item: "minecraft:string",
        },
      },
      result: {
        item: "minecraft:bow",
      },
    },
    {
      description: {
        identifier: "minecraft:bread",
      },

      tags: ["crafting_table"],
      pattern: ["###"],
      key: {
        "#": {
          item: "minecraft:wheat",
        },
      },
      result: {
        item: "minecraft:bread",
      },
    },
    {
      description: {
        identifier: "minecraft:cake",
      },

      tags: ["crafting_table"],
      pattern: ["AAA", "BEB", "CCC"],
      key: {
        A: {
          item: "minecraft:bucket",
          data: 1,
        },
        B: {
          item: "minecraft:sugar",
        },
        C: {
          item: "minecraft:wheat",
        },
        E: {
          item: "minecraft:egg",
        },
      },
      result: { item: "minecraft:cake" },
    },
    {
      description: {
        identifier: "minecraft:cauldron",
      },

      tags: ["crafting_table"],
      pattern: ["# #", "# #", "###"],
      key: {
        "#": {
          item: "minecraft:iron_ingot",
        },
      },
      result: {
        item: "minecraft:cauldron",
      },
    },
    {
      description: {
        identifier: "minecraft:cookie",
      },

      tags: ["crafting_table"],
      pattern: ["#X#"],
      key: {
        "#": {
          item: "minecraft:wheat",
        },
        X: {
          item: "minecraft:dye",
          data: 3,
        },
      },
      result: {
        item: "minecraft:cookie",
        count: 8,
      },
    },
    {
      description: {
        identifier: "minecraft:iron_sword",
      },

      tags: ["crafting_table"],
      pattern: ["X", "X", "#"],
      key: {
        "#": {
          item: "minecraft:stick",
        },
        X: {
          item: "minecraft:iron_ingot",
        },
      },
      result: {
        item: "minecraft:iron_sword",
      },
    },
    {
      description: {
        identifier: "minecraft:wooden_sword",
      },

      tags: ["crafting_table"],
      pattern: ["X", "X", "#"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 0,
        },
        X: {
          item: "minecraft:stick",
          data: 0,
        },
      },
      result: {
        item: "minecraft:wooden_sword",
      },
    },
    {
      description: {
        identifier: "minecraft:chest",
      },
      tags: [""],
      pattern: ["###", "# #", "###"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 0,
        },
      },
      result: {
        item: "minecraft:chest",
        data: 0,
        count: 1,
      },
    },
    {
      description: {
        identifier: "minecraft:crafting_table",
      },
      tags: [""],
      pattern: ["", "##", "##"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 0,
        },
      },
      result: {
        item: "minecraft:crafting_table",
        count: 1,
      },
    },
    {
      description: {
        identifier: "minecraft:stick",
      },
      tags: [""],
      pattern: ["", "", "##"],
      key: {
        "#": {
          item: "minecraft:planks",
          data: 0,
        },
      },
      result: {
        item: "minecraft:stick",
        data: 0,
        count: 4,
      },
    },
    {
      description: {
        identifier: "minecraft:furnace",
      },
      tags: [""],
      pattern: ["###", "# #", "###"],
      key: {
        "#": {
          item: "minecraft:cobblestone",
          data: 0,
        },
      },
      result: {
        item: "minecraft:furnace",
        data: 0,
        count: 1,
      },
    },
    {
      description: {
        identifier: "minecraft:stick",
      },
      tags: [""],
      pattern: ["###", "# #", "###"],
      key: {
        "#": {
          item: "minecraft:log",
          data: 0,
        },
      },
      result: {
        item: "minecraft:stick",
        data: 0,
        count: 1,
      },
    },
    {
      description: {
        identifier: "minecraft:torch",
      },
      tags: [""],
      pattern: ["", " X ", " #"],
      key: {
        X: {
          item: "minecraft:coal",
          data: 0,
        },
        "#": {
          item: "minecraft:stick",
          data: 0,
        },
      },
      result: {
        item: "minecraft:torch",
        data: 0,
        count: 1,
      },
    },
  ];
}
