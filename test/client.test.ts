import { describe, expect, it, vi } from "vitest";
import { TicketApiError, TicketClient } from "../src";

describe("TicketClient", () => {
  it("sends public headers and creates a ticket", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ continuationId: "continue-1", subject: "Help", status: "open" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new TicketClient({
      organizationId: "org-demo",
      publicApiKey: "sblabs-key-demo",
      baseUrl: "https://example.test/api/v1",
      fetch,
    });

    const result = await client.createTicket({
      subject: "Help",
      description: "Please help",
    });

    expect(result.continuationId).toBe("continue-1");
    expect(fetch).toHaveBeenCalledWith(
      "https://example.test/api/v1/public/tickets",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-organization-id": "org-demo",
          "x-ticket-public-key": "sblabs-key-demo",
        }),
      }),
    );
  });

  it("surfaces API errors without a success fallback", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid public key" }), { status: 401 }),
    );
    const client = new TicketClient({
      organizationId: "org-demo",
      publicApiKey: "bad-key",
      fetch,
    });

    await expect(client.getAiPrompts()).rejects.toEqual(
      expect.objectContaining({
        name: "TicketApiError",
        status: 401,
        message: "Invalid public key",
      }),
    );
  });
});
