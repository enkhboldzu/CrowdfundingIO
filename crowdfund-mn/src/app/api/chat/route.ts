import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/db/queries";
import { getPublicStats } from "@/lib/db/stats";

type ChatRole = "assistant" | "user";
type AiProvider = "openai" | "anthropic" | "ollama";

interface IncomingMessage {
  role: ChatRole;
  content: string;
}

interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
}

interface AnthropicResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  error?: {
    type?: string;
    message?: string;
  };
}

interface OllamaResponse {
  message?: {
    role?: string;
    content?: string;
  };
  error?: string;
}

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 900;

const SYSTEM_INSTRUCTIONS =
  "You are Crowdfund.mn's friendly AI assistant. Reply in Mongolian by default, but match the user's language if they clearly use another language. Keep answers short, practical, and specific to crowdfunding on Crowdfund.mn. Help with creating projects, exploring active projects, donations, QPay payments, accounts, platform rules, and navigation. Do not invent exact project, payment, legal, or account facts that are not in the provided context. If live data is missing, say so and guide the user to /explore, /create-project, /help, or /profile as appropriate. Never ask for card numbers, passwords, or sensitive credentials.";

function normalizeMessages(value: unknown): IncomingMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as Partial<IncomingMessage>;
      if (candidate.role !== "assistant" && candidate.role !== "user") return null;
      if (typeof candidate.content !== "string") return null;

      const content = candidate.content.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!content) return null;

      return { role: candidate.role, content };
    })
    .filter((message): message is IncomingMessage => Boolean(message))
    .slice(-MAX_MESSAGES);
}

function getConfiguredProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (provider === "anthropic" || provider === "claude") return "anthropic";
  if (provider === "ollama" || provider === "local") return "ollama";
  if (provider === "openai") return "openai";
  if (process.env.OLLAMA_MODEL && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return "ollama";
  }
  if (process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) return "anthropic";

  return "openai";
}

function getOpenAIOutputText(data: OpenAIResponse): string {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const text = data.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("\n")
    .trim();

  return text ?? "";
}

function getAnthropicOutputText(data: AnthropicResponse): string {
  return (
    data.content
      ?.filter((content) => content.type === "text" && typeof content.text === "string")
      .map((content) => content.text)
      .join("\n")
      .trim() ?? ""
  );
}

function getOllamaOutputText(data: OllamaResponse): string {
  return data.message?.content?.trim() ?? "";
}

function formatProviderError(provider: AiProvider, status: number, message?: string) {
  const label =
    provider === "anthropic" ? "Claude" : provider === "ollama" ? "Ollama" : "OpenAI";
  const lowerMessage = message?.toLowerCase() ?? "";

  if (provider === "ollama" && status === 404) {
    return "Ollama model олдсонгүй. `ollama pull qwen2.5:7b` ажиллуулаад эсвэл OLLAMA_MODEL нэрээ шалгаад дахин оролдоно уу.";
  }

  if (status === 401 || status === 403) {
    return `${label} API key буруу эсвэл идэвхгүй байна. Server env тохиргоогоо шалгана уу.`;
  }

  if (
    status === 429 ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("credit")
  ) {
    return `${label} API-ийн usage limit эсвэл billing quota хүрсэн байна. Billing/credit-ээ шалгаад дахин оролдоно уу.`;
  }

  return message ?? `${label} AI туслагчтай холбогдоход алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
  }).format(value);
}

async function buildSiteContext() {
  try {
    const [stats, projects] = await Promise.all([getPublicStats(), getProjects({ limit: 6 })]);

    const projectLines = projects
      .map((project) => {
        const percent = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;
        return `- ${project.title} (/projects/${project.slug}) | ${project.category} | ${formatMoney(project.raised)} / ${formatMoney(project.goal)} | ${percent}%`;
      })
      .join("\n");

    return [
      "Public stats:",
      `- Successful projects: ${stats.totalSuccessfulProjects}`,
      `- Total raised: ${formatMoney(stats.totalFundingRaised)}`,
      `- Total backers: ${stats.totalBackers}`,
      `- Success rate: ${stats.successRate}%`,
      "Recent active projects:",
      projectLines || "- No active project data is available right now.",
    ].join("\n");
  } catch {
    return "Live project statistics are unavailable right now.";
  }
}

function buildInput(messages: IncomingMessage[], siteContext: string) {
  const conversation = messages
    .map((message) => `${message.role === "user" ? "Хэрэглэгч" : "Туслагч"}: ${message.content}`)
    .join("\n\n");

  return [
    "Crowdfund.mn live context:",
    siteContext,
    "",
    "Conversation:",
    conversation,
    "",
    "Answer the latest user message.",
  ].join("\n");
}

function buildOllamaMessages(messages: IncomingMessage[], siteContext: string) {
  return [
    {
      role: "system",
      content: SYSTEM_INSTRUCTIONS,
    },
    {
      role: "user",
      content: [
        "Crowdfund.mn live context:",
        siteContext,
        "",
        "Use this live context when answering the conversation below.",
      ].join("\n"),
    },
    ...messages,
  ];
}

async function callOpenAI(messages: IncomingMessage[], siteContext: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenAI chatbot идэвхжээгүй байна. Server дээр OPENAI_API_KEY тохируулсны дараа ажиллана.",
      },
      { status: 503 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      instructions: SYSTEM_INSTRUCTIONS,
      input: buildInput(messages, siteContext),
      max_output_tokens: 450,
      store: false,
    }),
  });

  const data = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: formatProviderError("openai", response.status, data.error?.message) },
      { status: response.status }
    );
  }

  return NextResponse.json({
    message:
      getOpenAIOutputText(data) ||
      "Уучлаарай, одоогоор тодорхой хариу ирсэнгүй. Та асуултаа арай дэлгэрэнгүй бичээд дахин оролдоно уу.",
  });
}

async function callAnthropic(messages: IncomingMessage[], siteContext: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Claude chatbot идэвхжээгүй байна. Server дээр ANTHROPIC_API_KEY тохируулсны дараа ажиллана.",
      },
      { status: 503 }
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      system: SYSTEM_INSTRUCTIONS,
      max_tokens: 450,
      messages: [
        {
          role: "user",
          content: buildInput(messages, siteContext),
        },
      ],
    }),
  });

  const data = (await response.json()) as AnthropicResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: formatProviderError("anthropic", response.status, data.error?.message) },
      { status: response.status }
    );
  }

  return NextResponse.json({
    message:
      getAnthropicOutputText(data) ||
      "Уучлаарай, одоогоор тодорхой хариу ирсэнгүй. Та асуултаа арай дэлгэрэнгүй бичээд дахин оролдоно уу.",
  });
}

async function callOllama(messages: IncomingMessage[], siteContext: string) {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
  const apiKey = process.env.OLLAMA_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
      messages: buildOllamaMessages(messages, siteContext),
      stream: false,
      options: {
        temperature: 0.3,
      },
    }),
  });

  const data = (await response.json()) as OllamaResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: formatProviderError("ollama", response.status, data.error) },
      { status: response.status }
    );
  }

  return NextResponse.json({
    message:
      getOllamaOutputText(data) ||
      "Уучлаарай, одоогоор тодорхой хариу ирсэнгүй. Та асуултаа арай дэлгэрэнгүй бичээд дахин оролдоно уу.",
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Хүсэлтийн JSON буруу байна." }, { status: 400 });
  }

  const messages = normalizeMessages((payload as { messages?: unknown }).messages);
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage || lastMessage.role !== "user") {
    return NextResponse.json({ error: "Асуултаа бичээд дахин илгээнэ үү." }, { status: 400 });
  }

  const provider = getConfiguredProvider();
  const siteContext = await buildSiteContext();

  try {
    if (provider === "ollama") return await callOllama(messages, siteContext);
    if (provider === "anthropic") return await callAnthropic(messages, siteContext);
    return await callOpenAI(messages, siteContext);
  } catch {
    if (provider === "ollama") {
      return NextResponse.json(
        {
          error:
            "Ollama local server ажиллахгүй байна. `ollama serve` асаасан эсэх, OLLAMA_BASE_URL зөв эсэхийг шалгана уу.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "AI үйлчилгээ түр хугацаанд холбогдохгүй байна. Дахин оролдоно уу." },
      { status: 502 }
    );
  }
}
