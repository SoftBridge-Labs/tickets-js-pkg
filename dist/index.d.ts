type TicketPriority = "low" | "normal" | "high" | "urgent";
type TicketStatus = "open" | "pending" | "resolved" | "archived";
type MessageSender = "customer" | "agent" | "system";
interface TicketClientOptions {
    organizationId: string;
    publicApiKey: string;
    baseUrl?: string;
    fetch?: typeof globalThis.fetch;
}
interface CreateTicketInput {
    externalId?: string;
    customerId?: string;
    email?: string;
    name?: string;
    subject: string;
    description: string;
    metadata?: Record<string, unknown>;
}
interface WidgetCustomer {
    name?: string;
    email?: string;
    externalId?: string;
}
interface CustomerMessage {
    id?: string;
    body: string;
    senderType?: MessageSender;
    isInternal?: boolean;
    createdAt?: string;
}
interface PublicTicket {
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
interface CreateTicketResponse extends PublicTicket {
    initialMessage?: CustomerMessage;
}
interface AiPrompts {
    customSystemPrompt?: string;
    serviceDescription?: string;
    kbContextSnippets?: string[];
    escalationPolicy?: string;
    triageGuidelines?: string;
    organizationName?: string;
}
interface ConversationMessage {
    role: "user" | "assistant" | "system";
    content: string;
}
interface DeflectionResult {
    answer: string;
    shouldEscalate: boolean;
    articles?: Array<Record<string, unknown>>;
}

declare class TicketApiError extends Error {
    readonly status: number;
    readonly details: unknown;
    constructor(message: string, status: number, details?: unknown);
}
declare class TicketClient {
    private readonly baseUrl;
    private readonly requestFetch;
    private readonly headers;
    constructor(options: TicketClientOptions);
    createTicket(input: CreateTicketInput): Promise<CreateTicketResponse>;
    getAiPrompts(): Promise<AiPrompts>;
    getConversation(continuationId: string): Promise<PublicTicket>;
    sendMessage(continuationId: string, body: string): Promise<PublicTicket>;
    deflect(message: string, conversation?: ConversationMessage[]): Promise<DeflectionResult>;
    private request;
    private toError;
}

type LauncherStyle = "fab" | "side-tab" | "bottom-bar" | "inline";
type WidgetIcon = "lettermark" | "spark" | "question" | "smile" | "envelope" | "dot" | string;
type WidgetPosition = "bottom-right" | "bottom-left";
interface WidgetLabels {
    name?: string;
    email?: string;
    subject?: string;
    description?: string;
    submit?: string;
    sending?: string;
    success?: string;
}
interface WidgetOptions extends TicketClientOptions {
    title?: string;
    greeting?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    launcherLabel?: string;
    launcherStyle?: LauncherStyle;
    widgetIcon?: WidgetIcon;
    position?: WidgetPosition;
    panelWidth?: number;
    cornerRadius?: number;
    zIndex?: number;
    showName?: boolean;
    showEmail?: boolean;
    labels?: WidgetLabels;
    defaultCustomer?: WidgetCustomer;
    metadata?: Record<string, unknown>;
    mount?: HTMLElement;
    onSubmitted?: (ticket: CreateTicketResponse) => void;
    onError?: (error: unknown) => void;
}
declare class SupportWidget {
    private readonly client;
    private readonly options;
    private readonly root;
    private readonly panel;
    private continuationId?;
    constructor(options: WidgetOptions);
    open(): void;
    close(): void;
    destroy(): void;
    private render;
    private submit;
}

export { type AiPrompts, type ConversationMessage, type CreateTicketInput, type CreateTicketResponse, type CustomerMessage, type DeflectionResult, type LauncherStyle, type MessageSender, type PublicTicket, SupportWidget, TicketApiError, TicketClient, type TicketClientOptions, type TicketPriority, type TicketStatus, type WidgetCustomer, type WidgetIcon, type WidgetLabels, type WidgetOptions, type WidgetPosition };
