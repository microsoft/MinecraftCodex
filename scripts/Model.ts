import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "mojang-net";
import { game } from "./main.js";
import { OPENAI_API_KEY, OPENAI_ENGINE_ID, OPENAI_ORGANIZATION_ID } from "./vars.js";

// Model Class

export default class Model {
  completions: string[] = [];

  constructor() {
    this.completions = [];
  }

  // send the text we typed into Minecraft to OpenAI to get the code for the bot to run
  async getCompletion(prompt: string) {
    const req = new HttpRequest(`https://api.openai.com/v1/engines/${OPENAI_ENGINE_ID}/completions`);

    req.headers = [
      new HttpHeader("Content-Type", "application/json"),
      new HttpHeader("Accept", "application/json"),
      new HttpHeader("Authorization", `Bearer ${OPENAI_API_KEY}`),
      new HttpHeader("OpenAI-Organization", OPENAI_ORGANIZATION_ID),
    ];

    // temperature is how creative Codex can get, you want to keep this at 0 for repeatable results in code
    // stop is the string that says "this is the end of the code", the structure of the prompts file uses it to denote the next command
    // max tokens is the number of "words" codex should return, 500 being a good number to get a complete response for code
    req.body = JSON.stringify({
      prompt: prompt,

      max_tokens: 500,
      temperature: 0,
      stop: "//",
      n: 1,
    });

    req.method = HttpRequestMethod.POST;

    const response: any = await http.request(req);

    console.log("response code: " + response);

    if (response.status >= 400) {
      game?.bot.chat("Error respons  " + response.status);
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const resp = JSON.parse(response.body as any);

    this.completions = (resp as any).choices.map((choice: any) => choice.text);
    return this.completions[0];
  }
}
