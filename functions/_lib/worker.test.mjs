import test from "node:test";
import assert from "node:assert/strict";
import worker from "../../worker.js";

test("worker sends inquiries through the contact API", async () => {
  const sent = [];
  const response = await worker.fetch(
    new Request("https://creovelo.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alex Morgan",
        email: "alex@brand.com",
        brand: "North & Co",
        service: "Creative Testing Sprint",
        goals: "A first sprint.",
      }),
    }),
    {
      CONTACT_INBOX: "creovelo719@gmail.com",
      CONTACT_FROM: "hello@creovelo.com",
      EMAIL: {
        async send(message) {
          sent.push(message);
        },
      },
    }
  );
  assert.equal(response.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].html.includes("A first sprint"), true);
});

test("worker serves static assets for the homepage", async () => {
  const response = await worker.fetch(new Request("https://creovelo.com/"), {
    ASSETS: {
      async fetch() {
        return new Response("<html>ok</html>", { status: 200 });
      },
    },
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "<html>ok</html>");
});
