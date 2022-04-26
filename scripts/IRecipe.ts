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
