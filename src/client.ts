import type {
  AiPrompts,
  ConversationMessage,
  CreateTicketInput,
  CreateTicketResponse,
  DeflectionResult,
  PublicTicket,
  TicketClientOptions,
} from "./types";

const DEFAULT_BASE_URL = "https://office.softbridgelabs.in/api/v1";

export class TicketApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "TicketApiError";
    this.status = status;
    this.details = details;
  }
}

export class TicketClient {
  private readonly baseUrl: string;
  private readonly requestFetch: typeof globalThis.fetch;
  private readonly headers: Record<string, string>;

  constructor(options: TicketClientOptions) {
    if (!options.organizationId.trim() || !options.publicApiKey.trim()) {
      throw new Error("organizationId and publicApiKey are required.");
    }

    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.requestFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = {
      "Content-Type": "application/json",
      "x-organization-id": options.organizationId,
      "x-ticket-public-key": options.publicApiKey,
    };
  }

  createTicket(input: CreateTicketInput): Promise<CreateTicketResponse> {
    return this.request<CreateTicketResponse>("/public/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getAiPrompts(): Promise<AiPrompts> {
    return this.request<AiPrompts>("/public/ai-prompts");
  }

  getConversation(continuationId: string): Promise<PublicTicket> {
    return this.request<PublicTicket>(
      `/public/tickets/chat/${encodeURIComponent(requireContinuationId(continuationId))}`,
    );
  }

  sendMessage(continuationId: string, body: string): Promise<PublicTicket> {
    const message = body.trim();
    if (!message) throw new Error("Message body cannot be empty.");

    return this.request<PublicTicket>(
      `/public/tickets/chat/${encodeURIComponent(requireContinuationId(continuationId))}/messages`,
      { method: "POST", body: JSON.stringify({ body: message }) },
    );
  }

  deflect(
    message: string,
    conversation?: ConversationMessage[],
  ): Promise<DeflectionResult> {
    if (!message.trim()) throw new Error("Message cannot be empty.");

    return this.request<DeflectionResult>("/ai/deflect", {
      method: "POST",
      body: JSON.stringify({ message, conversation }),
    });
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await this.requestFetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers, ...init.headers },
    });

    if (!response.ok) throw await this.toError(response);
    return (await response.json()) as T;
  }

  private async toError(response: Response): Promise<TicketApiError> {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    const message =
      typeof details === "object" && details !== null && "message" in details
        ? String(details.message)
        : `Ticket request failed with status ${response.status}.`;
    return new TicketApiError(message, response.status, details);
  }
}

function requireContinuationId(value: string): string {
  if (!value.trim()) throw new Error("continuationId is required.");
  return value;
}
