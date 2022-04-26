import { http, Request, RequestMethod, Header } from "mojang-net";
import { CODEX_API_KEY } from "./vars.js";

export async function detectSensitiveContent(content: string): Promise<number> {
  const req: any = new Request(
    [new Header("Content-Type", "application/json"), new Header("Authorization", ` Bearer ${CODEX_API_KEY}`)],
    "https://api.openai.com/v1/engines/content-filter-alpha/completions",
    JSON.stringify({
      prompt: `<|endoftext|>[${content}]\n--\nLabel:`,
      temperature: 0,
      max_tokens: 1,
      top_p: 0,
      logprobs: 10,
    }),
    300,
    RequestMethod.POST
  );

  const response: any = await http.request(req);
  const filterFlag = (response.body as any).choices[0].text as string;
  return parseInt(filterFlag);
}
