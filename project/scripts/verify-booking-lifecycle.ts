/**
 * Guards the ActivityKind → initial booking status mapping (producer + B2C).
 * Run: pnpm exec tsx scripts/verify-booking-lifecycle.ts
 */
import { initialStatusForActivityKind } from "../src/app/api/bookings/booking-rules";

const cases = [
	["FIXED_SLOT", "CONFIRMED"],
	["FLEXIBLE", "PENDING"],
	["MULTI_DAY", "PENDING"],
	["RESOURCE_BASED", "NEW"],
] as const;

let failed = false;
for (const [kind, expected] of cases) {
	const got = initialStatusForActivityKind(kind);
	if (got !== expected) {
		console.error(`FAIL ${kind}: expected ${expected}, got ${got}`);
		failed = true;
	}
}

if (failed) process.exit(1);
console.log("booking lifecycle rules OK:", cases.map(([k, e]) => `${k}→${e}`).join(", "));
