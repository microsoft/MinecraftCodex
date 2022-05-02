/**
 * Context interface - represents the Context given to Codex
 */
export interface Context {
  background: string; // Background information about the prompt
  apiDoc: string; // A string of API documentation for the functions used in the dialog
  dialog: string; // An example dialog of NL -> Code interactions
}

/**
 * Prompt Class - used for constructing and updating prompts to Codex
 */
export default class Prompt {
  private context: Context;
  private interactions: string[] = []; // The NL->Code interactions between player and bot
  private dialog: string = ""; // The string representation of NL->Code interactions between the player and the bot
  private maxLength: number | undefined;

  constructor(context: Context, maxLength?: number) {
    this.context = context;
    this.dialog = context.dialog;
    this.interactions = [];
    if (maxLength) {
      this.maxLength = maxLength;
    }
  }

  /**
   * Adds NL -> Code interaction onto dialog, so that the model is aware of the interaction on future turns
   * @param nlCommand The Natural Language command from the player
   * @param codeCompletion The code returned from the model
   */
  addInteraction(nlCommand: string, codeCompletion: string) {
    // delete empty lines from codeCompletion string
    codeCompletion = codeCompletion.replace(/^\s*[\r\n]/gm, "");
    this.interactions.push(`// ${nlCommand}\n${codeCompletion}`);
    this.createDialog();
  }

  addText(textResponse: string) {
    this.interactions.push(textResponse);
  }

  /**
   * Removes the last interaction from the dialog
   */
  removeLastInteraction() {
    this.interactions.pop();
    this.createDialog();
  }

  /**
   * Creates the dialog string from the interactions array
   */
  createDialog() {
    this.dialog = this.interactions.reduce((dialog, interaction) => {
      return `${dialog}

${interaction}`;
    }, this.context.dialog);
    this.trimDialog();
  }

  /**
   * Trims characters off of the beginning of the dialog if needed. This is to make sure our prompts are small enough for the model being used.
   */
  trimDialog() {
    if (this.maxLength) {
      let promptLength = this.context.background.length + this.context.apiDoc.length + this.dialog.length;
      if (promptLength > this.maxLength) {
        let numToRemove = promptLength - this.maxLength;
        // Remove from the beginning of the dialog
        this.dialog = this.dialog.slice(numToRemove);
      }
    }
  }

  /**
   * Creates the prompt we call the model with, combining the background, apiDoc, dialog and the user's command
   * @param nlCommand The user's natural language command to the bot
   * @returns
   */
  craftPrompt(nlCommand: string) {
    return `${this.context.background}

${this.context.apiDoc}

${this.dialog}

// ${nlCommand}
`;
  }

  getContext() {
    return this.context;
  }

  /**
   * Resets the dialog to the initial state (just the examples)
   */
  resetInteractions() {
    this.dialog = this.context.dialog;
    this.interactions = [];
  }
}
