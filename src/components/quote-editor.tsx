"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { quoteMessages } from "@/lib/quote-messages";
import type { QuoteInput } from "@/lib/quote-drafts";
import {
  quoteCurrencies,
  currencyDigits,
  parseMoney,
  moneyInput,
  sellingTotal,
} from "../../packages/pricing/src/money.ts";
import SubmitButton from "./submit-button";
import { saveQuote } from "@/app/[locale]/workspace/[slug]/quotes/actions";
export default function QuoteEditor({
  locale,
  slug,
  id,
  revision,
  clients,
  initial,
}: {
  locale: Locale;
  slug: string;
  id: string;
  revision: number;
  clients: { id: string; full_name: string }[];
  initial: QuoteInput;
}) {
  const t = quoteMessages(locale);
  const [currency, setCurrency] = useState(initial.currency);
  const [days, setDays] = useState(initial.days);
  const [lines, setLines] = useState(
    initial.lines.map((l) => ({
      description: l.description,
      quantity: String(l.quantity),
      amount: moneyInput(l.unitMinor, initial.currency),
    })),
  );
  let total: string = "—";
  try {
    const minor = sellingTotal(
      lines.map((l) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unitMinor: parseMoney(l.amount, currency),
      })),
    );
    total = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(minor / 10 ** currencyDigits(currency));
  } catch {
    /* Incomplete form: no estimate until every amount is valid. */
  }
  return (
    <form className="form quote-editor" action={saveQuote}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="revision" value={revision} />
      <section className="panel">
        <label>
          {t.title}
          <input
            name="title"
            required
            minLength={2}
            maxLength={160}
            defaultValue={initial.title}
          />
        </label>
        <div className="field-grid">
          <div className="quote-select-field">
            <label htmlFor="quote-client">{t.client}</label>
            <select
              id="quote-client"
              name="clientId"
              required
              defaultValue={initial.clientId}
            >
              <option value="">{t.chooseClient}</option>
              {clients.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="quote-select-field">
            <label htmlFor="quote-currency">{t.currency}</label>
            <select
              id="quote-currency"
              name="currency"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setLines(lines.map((l) => ({ ...l, amount: "" })));
              }}
            >
              {quoteCurrencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <label>
            {t.startDate}
            <input
              type="date"
              name="startDate"
              required
              min="1900-01-01"
              defaultValue={initial.startDate}
            />
          </label>
          <label>
            {t.endDate}
            <input
              type="date"
              name="endDate"
              required
              defaultValue={initial.endDate}
            />
          </label>
          <label>
            {t.travelers}
            <input
              type="number"
              name="travelers"
              required
              min={1}
              max={1000}
              step={1}
              defaultValue={initial.travelers}
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <h2>{t.itinerary}</h2>
        <p>{t.datesHint}</p>
        {days.map((day, i) => (
          <fieldset key={i} className="quote-day">
            <legend>
              {t.day} {i + 1}
            </legend>
            <label>
              {t.dayTitle}
              <input
                name="dayTitle"
                required
                minLength={2}
                maxLength={160}
                value={day.title}
                onChange={(e) =>
                  setDays(
                    days.map((d, j) =>
                      j === i ? { ...d, title: e.target.value } : d,
                    ),
                  )
                }
              />
            </label>
            <div className="quote-select-field">
              <label htmlFor={`day-description-${i}`}>{t.narrative}</label>
              <textarea
                id={`day-description-${i}`}
                name="dayDescription"
                rows={3}
                maxLength={4000}
                value={day.description}
                onChange={(e) =>
                  setDays(
                    days.map((d, j) =>
                      j === i ? { ...d, description: e.target.value } : d,
                    ),
                  )
                }
              />
            </div>
            {days.length > 1 && (
              <button
                type="button"
                className="text-link"
                onClick={() => setDays(days.filter((_, j) => j !== i))}
              >
                {t.removeDay} {i + 1}
              </button>
            )}
          </fieldset>
        ))}
        <button
          type="button"
          className="button secondary"
          disabled={days.length >= 60}
          onClick={() => setDays([...days, { title: "", description: "" }])}
        >
          {t.addDay}
        </button>
      </section>
      <section className="panel">
        <h2>{t.prices}</h2>
        <p>{t.priceHint}</p>
        {lines.map((line, i) => (
          <fieldset className="quote-day" key={i}>
            <legend>
              {t.prices} {i + 1}
            </legend>
            <label>
              {t.description}
              <input
                name="lineDescription"
                required
                minLength={2}
                maxLength={240}
                value={line.description}
                onChange={(e) =>
                  setLines(
                    lines.map((l, j) =>
                      j === i ? { ...l, description: e.target.value } : l,
                    ),
                  )
                }
              />
            </label>
            <div className="field-grid">
              <label>
                {t.quantity}
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  required
                  value={line.quantity}
                  onChange={(e) =>
                    setLines(
                      lines.map((l, j) =>
                        j === i ? { ...l, quantity: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
              <label>
                {t.amount} ({currency})
                <input
                  name="amount"
                  inputMode="decimal"
                  required
                  value={line.amount}
                  onChange={(e) =>
                    setLines(
                      lines.map((l, j) =>
                        j === i ? { ...l, amount: e.target.value } : l,
                      ),
                    )
                  }
                />
              </label>
            </div>
            {lines.length > 1 && (
              <button
                type="button"
                className="text-link"
                onClick={() => setLines(lines.filter((_, j) => j !== i))}
              >
                {t.removeLine} {i + 1}
              </button>
            )}
          </fieldset>
        ))}
        <button
          type="button"
          className="button secondary"
          disabled={lines.length >= 100}
          onClick={() =>
            setLines([...lines, { description: "", quantity: "1", amount: "" }])
          }
        >
          {t.addLine}
        </button>
        <p className="quote-total" role="status">
          {t.total}: <strong>{total}</strong>
        </p>
      </section>
      <section className="panel">
        <div className="quote-select-field">
          <label htmlFor="quote-inclusions">{t.inclusions}</label>
          <textarea
            id="quote-inclusions"
            name="inclusions"
            maxLength={4000}
            rows={4}
            defaultValue={initial.inclusions}
          />
        </div>
        <div className="quote-select-field">
          <label htmlFor="quote-exclusions">{t.exclusions}</label>
          <textarea
            id="quote-exclusions"
            name="exclusions"
            maxLength={4000}
            rows={4}
            defaultValue={initial.exclusions}
          />
        </div>
      </section>
      <SubmitButton pending="…">{t.save}</SubmitButton>
    </form>
  );
}
