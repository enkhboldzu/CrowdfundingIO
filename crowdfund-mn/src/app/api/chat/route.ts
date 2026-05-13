import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/db/queries";
import { getPublicStats } from "@/lib/db/stats";

type ChatRole = "assistant" | "user";

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

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 900;

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

function getOutputText(data: OpenAIResponse): string {
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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI chatbot идэвхжээгүй байна. Server дээр OPENAI_API_KEY тохируулсны дараа ажиллана.",
      },
      { status: 503 }
    );
  }

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

  const siteContext = await buildSiteContext();

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
        instructions:
          "You are Crowdfund.mn's friendly AI assistant. Reply in Mongolian by default, but match the user's language if they clearly use another language. Keep answers short, practical, and specific to crowdfunding on Crowdfund.mn. Help with creating projects, exploring active projects, donations, QPay payments, accounts, platform rules, and navigation. Do not invent exact project, payment, legal, or account facts that are not in the provided context. If live data is missing, say so and guide the user to /explore, /create-project, /help, or /profile as appropriate. Never ask for card numbers, passwords, or sensitive credentials.",
        input: buildInput(messages, siteContext),
        max_output_tokens: 450,
        store: false,
      }),
    });

    const data = (await response.json()) as OpenAIResponse;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error?.message ??
            "AI туслагчтай холбогдоход алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.",
        },
        { status: response.status }
      );
    }

    const message = getOutputText(data);

    return NextResponse.json({
      message:
        message ||
        "Уучлаарай, одоогоор тодорхой хариу ирсэнгүй. Та асуултаа арай дэлгэрэнгүй бичээд дахин оролдоно уу.",
    });
  } catch {
    return NextResponse.json(
      { error: "AI үйлчилгээ түр хугацаанд холбогдохгүй байна. Дахин оролдоно уу." },
      { status: 502 }
    );
  }
}
