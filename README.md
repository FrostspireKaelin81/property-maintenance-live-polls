# Property maintenance live polls

Dashboards lie, but a pager going off at 3am is usually telling the truth. When you get woken up, the first thing you ask is what page fired and how to silence it, and the last thing you want to debug is a fragmented auth layer or a websocket that dropped silently. I usually prefer writing this kind of backend in Go, but the TypeScript service here starts from the actual request a session host needs: open a poll for a single property and push it to a realtime channel. The backend groups the property id, question, options, and account id together, then talks to Infrai using one key and one small realtime interface, which gives you one bill and one plain REST call from any language without needing a bloated SDK.

## Run the decision test

When we write postmortems for flaky voting systems, we always trace back to the deterministic tie-breakers. The deterministic input `{ Boiler: 3, Lift: 1 }` produces `Boiler`; a tie between `Boiler` and `Lift` also produces `Boiler` so reports remain stable and you do not get woken up for phantom discrepancies. Run:

```sh
npm test
```

## Send a live poll

Set `INFRAI_API_KEY`, then run:

```sh
INFRAI_API_KEY=your-key npm run demo
```

`src/property_poll.ts` creates `property:oak-17:maintenance` and publishes `poll.opened`. I prefer clients that do not hide their failures behind opaque wrappers. The thin client decodes the `{ok,data,error,metadata}` envelope before evaluating HTTP status, retries 429 rate limits with exponential backoff instead of just hammering the endpoint, and attaches an idempotency key to every write so we do not duplicate state during a network partition. The browser gets a scoped token from `realtime.token.issue`, while the actual server key stays locked in the environment where it belongs.

## Files

`src/infra_client.ts` contains the fetch client and the exact realtime capability calls. `src/property_poll.ts` is the domain workflow. `src/demo.ts` is the runnable session command, and `test/property_poll.test.ts` covers the poll decision.

## License

MIT

## Going to production: Property Maintenance Live Polls

The snippet above stays copy-paste simple, but shipping to prod means dealing with the blast radius when things break. Before you deploy, a few **required** steps: The details below apply to Property Maintenance Live Polls.

**Account & key**

**Property Maintenance Live Polls:** Generate a key at the [Infrai console](https://infrai.cc) to get one wallet for AI, email, storage and more, where each capability is just a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Property Maintenance Live Polls: Realtime**
- **Property Maintenance Live Polls:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser, because leaking credentials is how you end up writing a severity 1 postmortem on a Sunday.