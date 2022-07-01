import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "mojang-net";
import { OPENAI_API_KEY, OPENAI_ORGANIZATION_ID } from "./vars.js";

export async function detectSensitiveContent(content: string): Promise<number> {
  const req = new HttpRequest("https://api.openai.com/v1/moderations");

  req.headers = [
    new HttpHeader("Content-Type", "application/json"),
    new HttpHeader("Accept", "application/json"),
    new HttpHeader("Authorization", `Bearer ${OPENAI_API_KEY}`),
    new HttpHeader("OpenAI-Organization", OPENAI_ORGANIZATION_ID),
  ];

  req.method = HttpRequestMethod.POST;
  req.body = JSON.stringify({
    input: `<|endoftext|>[${content}]\n--\nLabel:`,
  });

  const response = await http.request(req);

  const resp = JSON.parse(response.body);

  const filterFlag = (resp as any).results[0].flagged as number;
  return filterFlag;
}
