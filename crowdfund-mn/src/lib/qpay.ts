export interface QpayBankUrl {
  name: string;
  description?: string;
  link: string;
  logo?: string;
}

export interface QpayInvoice {
  invoiceId: string;
  qrText: string;
  qrImage: string;
  urls: QpayBankUrl[];
  shortUrl?: string;
}

export interface QpayPaymentCheck {
  paid: boolean;
  paidAmount: number;
  paymentId?: string;
  paymentDate?: string;
}

class QpayError extends Error {
  constructor(message: string, readonly status?: number, readonly body?: unknown) {
    super(message);
  }
}

function qpayConfig() {
  const clientId =
    process.env.QPAY_CLIENT_ID ??
    process.env.QPAY_MERCHANT_USERNAME ??
    process.env.QPAY_USERNAME;
  const clientSecret =
    process.env.QPAY_CLIENT_SECRET ??
    process.env.QPAY_MERCHANT_PASSWORD ??
    process.env.QPAY_PASSWORD;
  const invoiceCode =
    process.env.QPAY_INVOICE_CODE ??
    process.env.QPAY_MERCHANT_INVOICE_CODE;

  if (!clientId || !clientSecret || !invoiceCode) {
    throw new QpayError("QPay тохиргоо дутуу байна. QPAY_MERCHANT_USERNAME, QPAY_MERCHANT_PASSWORD, QPAY_INVOICE_CODE env тохируулна уу.");
  }

  return {
    baseUrl: (process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn").replace(/\/$/, ""),
    clientId,
    clientSecret,
    invoiceCode,
  };
}

export function appBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

async function qpayToken() {
  const config = qpayConfig();
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await fetch(`${config.baseUrl}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    cache: "no-store",
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new QpayError("QPay access token авахад алдаа гарлаа.", response.status, body);
  }

  const token = asRecord(body).access_token;
  if (typeof token !== "string" || !token) {
    throw new QpayError("QPay access token буруу хариу ирлээ.", response.status, body);
  }

  return token;
}

async function qpayFetch(path: string, init: RequestInit) {
  const config = qpayConfig();
  const token = await qpayToken();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = await readJson(response);

  if (!response.ok) {
    throw new QpayError("QPay API хүсэлт амжилтгүй боллоо.", response.status, body);
  }

  return body;
}

function normalizeUrls(value: unknown): QpayBankUrl[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const row = asRecord(item);
    const link = row.link;

    if (typeof link !== "string" || !link) return [];

    return [{
      name: typeof row.name === "string" && row.name ? row.name : "Bank app",
      description: typeof row.description === "string" ? row.description : undefined,
      link,
      logo: typeof row.logo === "string" ? row.logo : undefined,
    }];
  });
}

function stringField(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

export async function createQpayInvoice(input: {
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
  callbackUrl: string;
}): Promise<QpayInvoice> {
  const config = qpayConfig();
  const description = input.description.trim().slice(0, 255) || "Crowdfund.mn дэмжлэг";
  const body = await qpayFetch("/v2/invoice", {
    method: "POST",
    body: JSON.stringify({
      invoice_code: config.invoiceCode,
      sender_invoice_no: input.senderInvoiceNo.slice(0, 45),
      invoice_receiver_code: input.receiverCode.slice(0, 45) || "terminal",
      invoice_description: description,
      amount: input.amount,
      callback_url: input.callbackUrl.slice(0, 255),
    }),
  });
  const row = asRecord(body);
  const invoiceId = stringField(row, "invoice_id", "invoiceId");
  const qrText = stringField(row, "qr_text", "qrText") ?? "";
  const qrImage = stringField(row, "qr_image", "qrImage") ?? "";
  const shortUrl = stringField(row, "qPay_shortUrl", "qpay_shortUrl", "qpayShortUrl", "short_url");

  if (!invoiceId) {
    throw new QpayError("QPay invoice_id буруу хариу ирлээ.", undefined, body);
  }

  return {
    invoiceId,
    qrText,
    qrImage,
    urls: normalizeUrls(row.urls),
    shortUrl,
  };
}

export async function checkQpayInvoicePayment(invoiceId: string): Promise<QpayPaymentCheck> {
  const body = await qpayFetch("/v2/payment/check", {
    method: "POST",
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
  });
  const row = asRecord(body);
  const paidAmount = Number(row.paid_amount ?? 0) || 0;
  const rows = Array.isArray(row.rows) ? row.rows.map(asRecord) : [];
  const paidRow = rows.find((payment) => payment.payment_status === "PAID");
  const paymentAmount = paidRow ? Number(paidRow.payment_amount ?? 0) || 0 : 0;
  const paymentId = paidRow ? stringField(paidRow, "payment_id") : undefined;
  const paymentDate = paidRow ? stringField(paidRow, "payment_date") : undefined;

  return {
    paid: Boolean(paidRow) || paidAmount > 0,
    paidAmount: Math.max(paidAmount, paymentAmount),
    paymentId,
    paymentDate,
  };
}
