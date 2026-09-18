import test from "node:test";
import assert from "node:assert/strict";
import { winningOption } from "../src/property_poll.ts";

test("chooses the leading maintenance request and breaks ties by name", () => {
  assert.equal(winningOption({ Boiler: 3, Lift: 1 }), "Boiler");
  assert.equal(winningOption({ Lift: 2, Boiler: 2 }), "Boiler");
  assert.equal(winningOption({ Boiler: 0, Lift: 0 }), null);
});
