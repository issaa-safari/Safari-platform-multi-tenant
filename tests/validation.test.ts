import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canManageClients,
  canManageSettings,
  validCompany,
  validClient,
  safePath,
} from "../src/lib/validation.ts";
test("company permissions distinguish consultant and finance from administration", () => {
  assert.equal(canManageClients("consultant"), true);
  assert.equal(canManageClients("finance"), false);
  assert.equal(canManageSettings("consultant"), false);
  assert.equal(canManageSettings("owner"), true);
});
test("company input rejects unsafe slugs and invalid time zones", () => {
  const input = {
    name: "Example Company",
    slug: "example-company",
    country: "FR",
    currency: "EUR",
    locale: "fr",
    timeZone: "Europe/Paris",
  };
  assert.equal(validCompany(input), true);
  assert.equal(validCompany({ ...input, slug: "../admin" }), false);
  assert.equal(validCompany({ ...input, timeZone: "not/a-zone" }), false);
});
test("international client names and phones are accepted; invalid details are rejected", () => {
  const input = {
    name: "Zoë García",
    email: "zoe@example.test",
    phone: "+33 1 23 45 67 89",
    notes: "A private note",
  };
  assert.equal(validClient(input), true);
  assert.equal(validClient({ ...input, email: "bad-email" }), false);
  assert.equal(validClient({ ...input, phone: "01234" }), false);
  assert.equal(validClient({ ...input, notes: "x".repeat(4001) }), false);
});
test("redirect paths cannot escape the application", () => {
  assert.equal(safePath("//evil.test", "/en/workspace"), "/en/workspace");
  assert.equal(safePath("/\\evil.test", "/en/workspace"), "/en/workspace");
  assert.equal(safePath("/fr/workspace", "/en/workspace"), "/fr/workspace");
});
