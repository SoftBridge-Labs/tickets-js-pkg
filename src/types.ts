export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus = "open" | "pending" | "resolved" | "archived";
export type MessageSender = "customer" | "agent" | "system";

export interface TicketClientOptions {
  organizationId: string;
  publicApiKey: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export interface CreateTicketInput {
  externalId?: string;
  customerId?: string;
  email?: string;
  name?: string;
  subject: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface WidgetCustomer {
  name?: string;
  email?: string;
  externalId?: string;
}

export interface CustomerMessage {
  id?: string;
  body: string;
  senderType?: MessageSender;
  isInternal?: boolean;
  createdAt?: string;
}

export interface PublicTicket {
  id?: string;
  subject: string;
  status: TicketStatus;
  priority?: TicketPriority;
  organizationName?: string;
  messages?: CustomerMessage[];
  continuationId: string;
  chatUrl?: string;
  createdAt?: string;
}

export interface CreateTicketResponse extends PublicTicket {
  initialMessage?: CustomerMessage;
}

export interface AiPrompts {
  customSystemPrompt?: string;
  serviceDescription?: string;
  kbContextSnippets?: string[];
  escalationPolicy?: string;
  triageGuidelines?: string;
  organizationName?: string;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DeflectionResult {
  answer: string;
  shouldEscalate: boolean;
  articles?: Array<Record<string, unknown>>;
}
