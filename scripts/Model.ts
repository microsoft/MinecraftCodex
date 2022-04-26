import { http, Request, RequestMethod, Header } from "mojang-net";
import { CODEX_API_KEY } from "./vars.js";

// Model Class

export default class Model {
  completions: string[] = [];

  constructor() {
    this.completions = [];
  }

  async getCompletion(prompt: string) {
    const req: any = new Request(
      [new Header("Content-Type", "application/json"), new Header("Authorization", ` Bearer ${CODEX_API_KEY}`)],
      "https://api.openai.com/v1/engines/davinci-codex-002-msft/completions",
      JSON.stringify({
        prompt: prompt,

        max_tokens: 500,
        temperature: 0,
        stop: "//",
        n: 1,
      }),
      300,
      RequestMethod.POST
    );

    const response: any = await http.request(req);

    console.log("response code: " + response);

    if (response.status >= 400) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    this.completions = (response.body as any).choices.map((choice: any) => choice.text);
    return this.completions[0];
  }
}
