import { test, expect } from "@playwright/test";
test("localized catalogue, filtering, route navigation and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A world of adventure",
  );
  await page.getByLabel("Language", { exact: true }).selectOption("fr");
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.getByRole("link", { name: "Explorer la collection" }).click();
  await expect(page.locator(".trip-card")).toHaveCount(3);
  await page
    .getByLabel("Destination", { exact: true })
    .selectOption("tanzania");
  await page.getByRole("button", { name: "Explorer les safaris" }).click();
  await expect(page.locator(".trip-card")).toHaveCount(1);
  await page.getByRole("link", { name: /Le circuit du nord/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Le circuit du nord de la Tanzanie",
  );
  await expect(page.getByText(/Cet itinéraire est un exemple/)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("private pages require sign-in", async ({ page }) => {
  await page.goto("/es/workspace");
  await expect(page).toHaveURL(/\/es\/login$/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión", exact: true }),
  ).toBeVisible();
});
test("account to company to private client to settings", async ({ page }) => {
  test.skip(
    !process.env.FOUNDATION_TEST_EMAIL || !process.env.FOUNDATION_TEST_PASSWORD,
    "Requires an isolated, confirmed synthetic fixture account.",
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const tag = process.env.FOUNDATION_TEST_TAG!;
  await page.goto("/en/login");
  await page
    .getByLabel("Email address")
    .fill(process.env.FOUNDATION_TEST_EMAIL!);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.FOUNDATION_TEST_PASSWORD!);
  await page.getByRole("button", { name: /^Sign in/ }).click();
  await expect(page).toHaveURL(/\/en\/workspace$/);
  await page.getByRole("link", { name: /Create a company/ }).click();
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Foundation browser company");
  await page.getByLabel("Workspace address").fill(tag);
  await page.getByLabel("Company country").fill("FR");
  await page.getByLabel("Company base currency").fill("EUR");
  await page.getByLabel("Company time zone").fill("Europe/Paris");
  await page.getByRole("button", { name: /Create workspace/ }).click();
  await expect(page).toHaveURL(new RegExp(`/en/workspace/${tag}$`));
  await page.getByRole("link", { name: /Add a client/ }).click();
  await page.getByLabel("Full name").fill("Zoë García");
  await page.getByLabel("Email address").fill("traveler@foundation.example");
  await page
    .getByLabel("Phone (international format)")
    .fill("+33 1 23 45 67 89");
  await page
    .getByLabel("Private notes")
    .fill("Browser fixture, to be deleted.");
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(page.getByRole("heading", { name: "Zoë García" })).toBeVisible();
  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Edit client", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Zoë García");
  await expect(page.getByLabel("Email address")).toHaveValue(
    "traveler@foundation.example",
  );
  await page.getByLabel("Full name").fill("Zoë García Updated");
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(
    page.getByRole("heading", { name: "Zoë García Updated" }),
  ).toBeVisible();
  await expect(page.locator(".client-row")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Quotes & itineraries", exact: true })
    .click();
  await page.getByRole("link", { name: "Create a quote", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Create a quote", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Trip title", { exact: true })
    .fill("Private safari browser draft");
  await page
    .getByLabel("Client", { exact: true })
    .selectOption({ label: "Zoë García Updated" });
  await page.getByLabel("Quote currency", { exact: true }).selectOption("EUR");
  await page.getByLabel("Trip start date", { exact: true }).fill("2026-11-01");
  await page.getByLabel("Trip end date", { exact: true }).fill("2026-11-02");
  await page
    .getByLabel("Day title", { exact: true })
    .fill("Arrival in Nairobi");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Meet your guide.");
  await page.getByRole("button", { name: "Add a day", exact: true }).click();
  await page
    .getByLabel("Day title", { exact: true })
    .nth(1)
    .fill("Safari and departure");
  await page
    .getByLabel("Description", { exact: true })
    .nth(1)
    .fill("Game drive and transfer.");
  await page
    .getByLabel("Service description", { exact: true })
    .fill("Private safari package");
  await page.getByLabel("Quantity", { exact: true }).fill("3");
  await page
    .getByLabel("Unit selling price (EUR)", { exact: true })
    .fill("100.01");
  await expect(page.locator(".quote-total")).toContainText("€300.03");
  await page
    .getByLabel("Included services", { exact: true })
    .fill("Guide and transport");
  await page
    .getByRole("button", { name: "Save quote draft", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Edit quote draft", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Trip title", { exact: true })).toHaveValue(
    "Private safari browser draft",
  );
  await expect(
    page.getByLabel("Day title", { exact: true }).nth(1),
  ).toHaveValue("Safari and departure");
  const stale = await page.context().newPage();
  await stale.goto(page.url());
  await expect(stale.getByLabel("Trip title", { exact: true })).toHaveValue(
    "Private safari browser draft",
  );
  await page
    .getByLabel("Trip title", { exact: true })
    .fill("Updated safari draft");
  await page
    .getByRole("button", { name: "Save quote draft", exact: true })
    .click();
  await expect(page.locator(".eyebrow")).toContainText("Revision 2");
  await stale
    .getByLabel("Trip title", { exact: true })
    .fill("Stale title must not overwrite");
  await stale
    .getByRole("button", { name: "Save quote draft", exact: true })
    .click();
  await expect(
    stale
      .getByRole("alert")
      .filter({ hasText: "changed while you were editing" }),
  ).toContainText("changed while you were editing");
  await expect(stale.getByLabel("Trip title", { exact: true })).toHaveValue(
    "Updated safari draft",
  );
  await stale.close();
  await page.screenshot({
    path: "test-results/adapted-quote-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/adapted-quote-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("link", { name: "Back to quotes", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Updated safari draft", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("€300.03", { exact: true })).toBeVisible();
  await page
    .getByRole("link", { name: "Company settings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Company settings", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Company base currency").fill("GBP");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  await expect(page.getByLabel("Company base currency")).toHaveValue("GBP");
  await page
    .getByRole("link", { name: "Your company workspaces", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your company workspaces", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login$/);
  await page.goto(`/en/workspace/${tag}/clients`);
  await expect(page).toHaveURL(/\/en\/login$/);
  expect(errors).toEqual([]);
});
