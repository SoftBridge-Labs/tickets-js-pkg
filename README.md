# @softbridgelabs/tickets

Framework-agnostic browser SDK and embeddable support widget for SoftBridge Tickets.

Build a customer support experience into any website with a small, framework-agnostic client SDK. **Powered by SoftBridge Tickets.**

This package is intentionally client-side only. It never includes workspace/admin operations, Firebase credentials, or tenant defaults. Each application supplies its own organization ID and public API key.

## Get started with SoftBridge Tickets

- [Read about SoftBridge Tickets](https://office.softbridgelabs.in/products/tickets) to learn how the product works.
- [Access SoftBridge Tickets](https://office.softbridgelabs.in/tickets) to create or manage your organization and get the `organizationId` and `publicApiKey` used by this SDK.
- [Create a new SoftBridge Labs account](https://account.softbridgelabs.in/) if you do not have an account yet.
- Need help? Contact [support@softbridgelabs.in](mailto:support@softbridgelabs.in).

## Install

```bash
npm install @softbridgelabs/tickets
```

## Use the API client

```ts
import { TicketClient } from "@softbridgelabs/tickets";

const tickets = new TicketClient({
  organizationId: import.meta.env.VITE_TICKETS_ORGANIZATION_ID,
  publicApiKey: import.meta.env.VITE_TICKETS_PUBLIC_KEY,
});

const ticket = await tickets.createTicket({
  externalId: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  subject: "I need help",
  description: "The export button is not working.",
  metadata: { page: location.href, plan: "pro" },
});

await tickets.sendMessage(ticket.continuationId, "It is still happening.");
const conversation = await tickets.getConversation(ticket.continuationId);
```

Only send the public key and non-sensitive browser context to the browser. The continuation ID is a bearer credential; keep it private and do not log it.

## Add the ready-made widget

```ts
import { SupportWidget } from "@softbridgelabs/tickets";

new SupportWidget({
  organizationId: "your-organization-id",
  publicApiKey: "sblabs-key-your-key",
  title: "Talk to our team",
  greeting: "Questions, feedback, or bugs—we're here.",
  accentColor: "#635bff",
  launcherStyle: "fab",
  widgetIcon: "spark",
});
```

### Widget customization

The widget is deliberately unopinionated and can be adapted to your brand without a CSS framework:

```ts
new SupportWidget({
  organizationId: "your-organization-id",
  publicApiKey: "sblabs-key-your-key",
  title: "Customer care",
  greeting: "We usually reply within one business day.",
  accentColor: "#0f766e",
  backgroundColor: "#f8fafc",
  textColor: "#102a43",
  launcherStyle: "side-tab", // "fab" | "side-tab" | "bottom-bar" | "inline"
  widgetIcon: "envelope",   // built-in icon name or your own short text
  position: "bottom-left",
  panelWidth: 440,
  cornerRadius: 14,
  zIndex: 10000,
  showName: true,
  showEmail: true,
  labels: {
    name: "Full name",
    email: "Work email",
    subject: "Topic",
    description: "How can we help?",
    submit: "Send to support",
    sending: "Submitting...",
    success: "Your request is on its way.",
  },
  defaultCustomer: {
    externalId: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
  },
  metadata: { page: location.pathname, plan: "pro" },
  onSubmitted: (ticket) => analytics.track("support_ticket_created", {
    ticketId: ticket.id,
  }),
  onError: (error) => console.error("Support widget error", error),
});
```

Available built-in icons are `lettermark`, `spark`, `question`, `smile`, `envelope`, and `dot`. The `inline` launcher is positioned relative to its mount element; the other styles use a fixed viewport launcher. For a completely custom experience, use `TicketClient` to build your own UI in React, Vue, Svelte, or plain JavaScript.

## Customer-facing AI

```ts
const prompts = await tickets.getAiPrompts();
const answer = await tickets.deflect("How do I reset my password?");
```

Use `answer.shouldEscalate` to decide when to create a human ticket. AI-first responses are not started by public ticket intake; the customer can always start a human conversation through `createTicket`.

## Configuration

| Option | Required | Description |
| --- | --- | --- |
| `organizationId` | Yes | Your SoftBridge Tickets organization ID |
| `publicApiKey` | Yes | Your tenant-scoped public key |
| `baseUrl` | No | API base URL, defaulting to the SoftBridge Tickets API |
| `fetch` | No | Custom fetch implementation for tests or edge runtimes |


The included [publish workflow](./.github/workflows/publish.yml) runs on every push. It verifies types, tests, and builds before publishing a version that is not already on npm. Repeated pushes with the same package version are safely skipped.

1. Create a granular npm access token from the [npm token settings](https://www.npmjs.com/settings/softbridgelabs/tokens/granular-access-tokens/new).
2. Give it publish access to `@softbridgelabs/tickets` and enable 2FA/automation according to your npm account settings.
3. Add it to the GitHub repository as an Actions secret named `NPM_TOKEN`.
4. Bump `version` in `package.json` when you want the next push to publish a release.

Never commit the token or put it in browser code. The workflow reads it only through `secrets.NPM_TOKEN`.

## License

MIT
