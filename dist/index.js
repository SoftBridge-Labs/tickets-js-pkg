// src/client.ts
var DEFAULT_BASE_URL = "https://office.softbridgelabs.in/api/v1";
var TicketApiError = class extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "TicketApiError";
    this.status = status;
    this.details = details;
  }
};
var TicketClient = class {
  constructor(options) {
    if (!options.organizationId.trim() || !options.publicApiKey.trim()) {
      throw new Error("organizationId and publicApiKey are required.");
    }
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.requestFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.headers = {
      "Content-Type": "application/json",
      "x-organization-id": options.organizationId,
      "x-ticket-public-key": options.publicApiKey
    };
  }
  createTicket(input) {
    return this.request("/public/tickets", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
  getAiPrompts() {
    return this.request("/public/ai-prompts");
  }
  getConversation(continuationId) {
    return this.request(
      `/public/tickets/chat/${encodeURIComponent(requireContinuationId(continuationId))}`
    );
  }
  sendMessage(continuationId, body) {
    const message = body.trim();
    if (!message) throw new Error("Message body cannot be empty.");
    return this.request(
      `/public/tickets/chat/${encodeURIComponent(requireContinuationId(continuationId))}/messages`,
      { method: "POST", body: JSON.stringify({ body: message }) }
    );
  }
  deflect(message, conversation) {
    if (!message.trim()) throw new Error("Message cannot be empty.");
    return this.request("/ai/deflect", {
      method: "POST",
      body: JSON.stringify({ message, conversation })
    });
  }
  async request(path, init = {}) {
    const response = await this.requestFetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers, ...init.headers }
    });
    if (!response.ok) throw await this.toError(response);
    return await response.json();
  }
  async toError(response) {
    let details;
    try {
      details = await response.json();
    } catch {
      details = void 0;
    }
    const message = typeof details === "object" && details !== null && "message" in details ? String(details.message) : `Ticket request failed with status ${response.status}.`;
    return new TicketApiError(message, response.status, details);
  }
};
function requireContinuationId(value) {
  if (!value.trim()) throw new Error("continuationId is required.");
  return value;
}

// src/widget.ts
var SupportWidget = class {
  constructor(options) {
    if (typeof document === "undefined") {
      throw new Error("SupportWidget can only be created in a browser.");
    }
    this.client = new TicketClient(options);
    this.options = {
      title: options.title ?? "How can we help?",
      greeting: options.greeting ?? "Send us a message and our team will get back to you.",
      accentColor: options.accentColor ?? "#635bff",
      backgroundColor: options.backgroundColor ?? "#ffffff",
      textColor: options.textColor ?? "#17172a",
      launcherLabel: options.launcherLabel ?? "Support",
      launcherStyle: options.launcherStyle ?? "fab",
      widgetIcon: options.widgetIcon ?? "spark",
      position: options.position ?? "bottom-right",
      panelWidth: options.panelWidth ?? 390,
      cornerRadius: options.cornerRadius ?? 20,
      zIndex: options.zIndex ?? 2147483e3,
      showName: options.showName ?? true,
      showEmail: options.showEmail ?? true,
      labels: {
        name: options.labels?.name ?? "Your name",
        email: options.labels?.email ?? "Email address",
        subject: options.labels?.subject ?? "What can we help with?",
        description: options.labels?.description ?? "Tell us a little more...",
        submit: options.labels?.submit ?? "Start conversation",
        sending: options.labels?.sending ?? "Sending...",
        success: options.labels?.success ?? "Thanks! Your conversation has been started."
      }
    };
    this.root = document.createElement("div");
    this.panel = document.createElement("div");
    this.render();
    (options.mount ?? document.body).append(this.root);
  }
  open() {
    this.panel.hidden = false;
  }
  close() {
    this.panel.hidden = true;
  }
  destroy() {
    this.root.remove();
  }
  render() {
    const rootClass = `sbl-widget sbl-${this.options.launcherStyle} sbl-${this.options.position}`;
    this.root.innerHTML = `
      <style>
        .sbl-widget, .sbl-widget * { box-sizing: border-box; }
        .sbl-widget { position: relative; z-index: ${this.options.zIndex}; }
        .sbl-launcher { border: 0; color: #fff; background: var(--sbl-accent);
          box-shadow: 0 12px 30px #0002; cursor: pointer; font: 600 14px system-ui; }
        .sbl-fab .sbl-launcher { position: fixed; bottom: 24px;
          padding: 14px 20px; border-radius: 999px; }
        .sbl-bottom-bar .sbl-launcher { position: fixed; right: 0; bottom: 0; left: 0; width: 100%;
          padding: 14px 20px; border-radius: 0; }
        .sbl-side-tab .sbl-launcher { position: fixed; top: 50%; padding: 14px 12px;
          border-radius: 12px 12px 0 0; transform: translateY(-50%) rotate(-90deg); }
        .sbl-inline .sbl-launcher { padding: 12px 18px; border-radius: 999px; }
        .sbl-bottom-right .sbl-launcher { right: 24px; }
        .sbl-bottom-left .sbl-launcher { left: 24px; }
        .sbl-side-tab.sbl-bottom-right .sbl-launcher { right: -28px; }
        .sbl-side-tab.sbl-bottom-left .sbl-launcher { left: -28px; }
        .sbl-panel { position: fixed; bottom: 82px; width: min(${this.options.panelWidth}px, calc(100vw - 32px));
          overflow: hidden; border: 1px solid #e8e8ef; border-radius: ${this.options.cornerRadius}px; background: var(--sbl-background);
          box-shadow: 0 18px 60px #17172a26; font: 14px system-ui; color: var(--sbl-text); }
        .sbl-inline .sbl-panel { position: absolute; right: 0; bottom: auto; margin-top: 12px; }
        .sbl-bottom-left .sbl-panel { left: 24px; } .sbl-bottom-right .sbl-panel { right: 24px; }
        .sbl-inline .sbl-panel { left: 0; }
        .sbl-head { padding: 22px; color: #fff; background: var(--sbl-accent); }
        .sbl-head h2 { margin: 0 0 6px; font-size: 19px; } .sbl-head p { margin: 0; opacity: .85; }
        .sbl-form { display: grid; gap: 10px; padding: 18px; } .sbl-form label { display: grid; gap: 5px;
          color: var(--sbl-text); font-size: 12px; font-weight: 600; } .sbl-form input, .sbl-form textarea {
          width: 100%; padding: 11px 12px; border: 1px solid #dedee8; border-radius: 10px; font: inherit; }
        .sbl-form textarea { min-height: 100px; resize: vertical; } .sbl-form button { border: 0;
          border-radius: 10px; padding: 12px; color: #fff; background: var(--sbl-accent); cursor: pointer; }
        .sbl-status { min-height: 20px; margin: 0; color: #555568; } .sbl-status[data-error="true"] { color: #b42318; }
        .sbl-icon { margin-right: 6px; }
        .sbl-panel[hidden] { display: none; }
      </style>
      <button class="sbl-launcher" type="button"><span class="sbl-icon">${escapeHtml(iconFor(this.options.widgetIcon))}</span>${escapeHtml(this.options.launcherLabel)}</button>
    `;
    this.root.className = rootClass;
    this.root.style.setProperty("--sbl-accent", this.options.accentColor);
    this.root.style.setProperty("--sbl-background", this.options.backgroundColor);
    this.root.style.setProperty("--sbl-text", this.options.textColor);
    this.panel.className = "sbl-panel";
    this.panel.hidden = true;
    this.panel.innerHTML = `
      <header class="sbl-head"><h2>${escapeHtml(this.options.title)}</h2>
        <p>${escapeHtml(this.options.greeting)}</p></header>
      <form class="sbl-form">
        ${this.options.showName ? `<label>${escapeHtml(this.options.labels.name)}<input name="name" autocomplete="name"></label>` : ""}
        ${this.options.showEmail ? `<label>${escapeHtml(this.options.labels.email)}<input name="email" type="email" autocomplete="email"></label>` : ""}
        <label>${escapeHtml(this.options.labels.subject)}<input name="subject" required></label>
        <label>${escapeHtml(this.options.labels.description)}<textarea name="description" required></textarea></label>
        <p class="sbl-status" role="status"></p><button type="submit">${escapeHtml(this.options.labels.submit)}</button>
      </form>
    `;
    const customer = this.options.defaultCustomer;
    const name = this.panel.querySelector('[name="name"]');
    const email = this.panel.querySelector('[name="email"]');
    if (name && customer?.name) name.value = customer.name;
    if (email && customer?.email) email.value = customer.email;
    this.root.append(this.panel);
    this.root.querySelector(".sbl-launcher").onclick = () => this.open();
    this.panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit(event.currentTarget);
    });
  }
  async submit(form) {
    const status = this.panel.querySelector(".sbl-status");
    const data = new FormData(form);
    const input = {
      name: String(data.get("name") ?? "").trim() || void 0,
      email: String(data.get("email") ?? "").trim() || void 0,
      externalId: this.options.defaultCustomer?.externalId,
      subject: String(data.get("subject") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      metadata: this.options.metadata
    };
    status.dataset.error = "false";
    status.textContent = this.options.labels.sending;
    const submitButton = form.querySelector("button[type=submit]");
    if (submitButton) submitButton.disabled = true;
    try {
      const ticket = await this.client.createTicket(input);
      this.continuationId = ticket.continuationId;
      status.textContent = this.options.labels.success;
      form.reset();
      this.options.onSubmitted?.(ticket);
    } catch (error) {
      status.dataset.error = "true";
      status.textContent = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      this.options.onError?.(error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }
};
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
function iconFor(icon) {
  const icons = {
    lettermark: "S",
    spark: "\u2726",
    question: "?",
    smile: "\u263B",
    envelope: "\u2709",
    dot: "\u25CF"
  };
  return icons[icon] ?? icon;
}
export {
  SupportWidget,
  TicketApiError,
  TicketClient
};
//# sourceMappingURL=index.js.map