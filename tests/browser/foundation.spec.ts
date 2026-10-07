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
