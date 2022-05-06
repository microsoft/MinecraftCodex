import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "mojang-net";
import { CODEX_API_KEY } from "./vars.js";

// Model Class

export default class Model {
  completions: string[] = [];

  constructor() {
    this.completions = [];
  }

  async getCompletion(prompt: string) {
    const req = new HttpRequest("https://api.openai.com/v1/engines/davinci-codex-002-msft/completions");

    req.headers = [
      new HttpHeader("Content-Type", "application/json"),
      new HttpHeader("Accept", "application/json"),
      new HttpHeader("Authorization", `Bearer ${CODEX_API_KEY}`),
    ];

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
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const resp = JSON.parse(response.body as any);

    this.completions = (resp as any).choices.map((choice: any) => choice.text);
    return this.completions[0];
  }
}
