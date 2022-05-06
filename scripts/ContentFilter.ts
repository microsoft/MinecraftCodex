import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "mojang-net";
import { CODEX_API_KEY } from "./vars.js";

export async function detectSensitiveContent(content: string): Promise<number> {
  const req = new HttpRequest("https://api.openai.com/v1/engines/content-filter-alpha/completions");

  req.headers = [
    new HttpHeader("Content-Type", "application/json"),
    new HttpHeader("Accept", "application/json"),
    new HttpHeader("Authorization", `Bearer ${CODEX_API_KEY}`),
  ];

  req.method = HttpRequestMethod.POST;
  req.body = JSON.stringify({
    prompt: `<|endoftext|>[${content}]\n--\nLabel:`,
    temperature: 0,
    max_tokens: 1,
    top_p: 0,
    logprobs: 10,
  });

  const response = await http.request(req);

  const resp = JSON.parse(response.body);

  const filterFlag = (resp as any).choices[0].text as string;
  return parseInt(filterFlag);
}
