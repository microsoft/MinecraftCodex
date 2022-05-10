// data structure for storing minecraft recipes
// description should be the minecraft name
// tags are what iconography you are using in pattern
// which is a 3x3 representing the player craft inventory
// key is defining the link between the tag and a specific item in minecraft
// essentially key is the recipe, and result is the final item
// for more recipes, refer to : https://minecraft.fandom.com/wiki/Recipe_book
export default interface IRecipe {
  description: IRecipeDescription;
  tags: string[];
  group?: string;
  pattern: string[];
  key: { [key: string]: IRecipeIngredient };
  result: IRecipeResult;
}

export interface IRecipeDescription {
  identifier: string;
}

export interface IRecipeIngredient {
  item: string;
  data?: number;
}

export interface IRecipeResult {
  item: string;
  data?: number;
  count?: number;
}
