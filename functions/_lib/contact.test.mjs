import test from "node:test";
import assert from "node:assert/strict";
import {
  parseContact,
  buildInquiry,
  isAllowedOrigin,
  handleContactRequest,
} from "./contact.js";

test("rejects an incomplete inquiry", () => {
  const parsed = parseContact({
    name: "A",
    email: "not-an-email",
    brand: "",
    service: "Something else",
    goals: "",
  });
  assert.equal(parsed.ok, false);
});

test("accepts a complete inquiry", () => {
  const parsed = parseContact({
    name: "Alex Morgan",
    email: "alex@brand.com",
    brand: "North & Co",
    service: "Creative Testing Sprint",
    goals: "Test a quieter ritual angle.",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.inquiry.email, "alex@brand.com");
});

test("quietly ignores honeypot spam", () => {
  const parsed = parseContact({
    name: "Bot",
    email: "bot@spam.com",
    brand: "Spam",
    service: "Creative Testing Sprint",
    company_website: "https://spam.example",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.ignored, true);
});

test("builds a reply-ready email body", () => {
  const message = buildInquiry({
    name: "Alex Morgan",
    email: "alex@brand.com",
    brand: "North & Co",
    service: "Monthly Creative Partner",
    goals: "Need a new testing calendar.",
  });
  assert.match(message.subject, /Monthly Creative Partner/);
  assert.match(message.text, /alex@brand.com/);
  assert.match(message.text, /Need a new testing calendar/);
});

test("allows the live site and local previews", () => {
  assert.equal(isAllowedOrigin("https://creovelo.com", "https://creovelo.com/api/contact"), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:8765", "http://127.0.0.1:8765/api/contact"), true);
  assert.equal(isAllowedOrigin("https://evil.example", "https://creovelo.com/api/contact"), false);
});

test("delivers through a mock email binding", async () => {
  const sent = [];
  const response = await handleContactRequest(
    new Request("http://127.0.0.1/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1" },
      body: JSON.stringify({
        name: "Alex Morgan",
        email: "alex@brand.com",
        brand: "North & Co",
        service: "Let’s find the right fit",
        goals: "Start with one product.",
      }),
    }),
    {
      CONTACT_INBOX: "hello-owner@example.com",
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
  assert.equal(sent[0].to, "hello-owner@example.com");
  assert.equal(sent[0].replyTo, "alex@brand.com");
});

test("returns 503 when email is not configured", async () => {
  const response = await handleContactRequest(
    new Request("http://127.0.0.1/api/contact", {
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
    {}
  );
  assert.equal(response.status, 503);
});
