import {test} from "node:test";
import assert from "node:assert/strict";
import {localeOf,messages,money,dateTime,directionOf} from "../src/lib/i18n.ts";
test("unsupported locale falls back and all launch dictionaries have the same keys",()=>{assert.equal(localeOf("not-a-locale"),"en");for(const l of ["fr","es"] as const)assert.deepEqual(Object.keys(messages(l)),Object.keys(messages("en")));assert.notEqual(messages("fr").login,messages("en").login);});
test("currency precision follows the contractual currency",()=>{assert.match(money(12.5,"USD","en"),/12\.50/);assert.match(money(12.5,"JPY","en"),/13/);assert.doesNotMatch(money(12.5,"JPY","en"),/\.50/);assert.match(money(12.5,"EUR","fr"),/12,50/);});
test("event date display follows the company time zone",()=>{const utc=dateTime("2026-01-01T23:30:00Z","en","UTC");const nairobi=dateTime("2026-01-01T23:30:00Z","en","Africa/Nairobi");assert.match(utc,/Jan 1, 2026/);assert.match(nairobi,/Jan 2, 2026/);});
test("direction supports future RTL locales without a fixed two-language model",()=>{assert.equal(directionOf("fr"),"ltr");assert.equal(directionOf("ar-SA"),"rtl");assert.equal(directionOf("he"),"rtl");});
