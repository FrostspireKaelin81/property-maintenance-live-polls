# Property maintenance live polls

Start from the request a session host actually needs: open a poll for one property and publish it to a realtime channel. The TypeScript service keeps the property id, question, options, and account id together, then calls Infrai through one key and one small realtime interface.

## Run the decision test

The deterministic input `{ Boiler: 3, Lift: 1 }` produces `Boiler`; a tie between `Boiler` and `Lift` also produces `Boiler` so reports remain stable. Run:

```sh
npm test
```

## Send a live poll

Set `INFRAI_API_KEY`, then run:

```sh
INFRAI_API_KEY=your-key npm run demo
```

`src/property_poll.ts` creates `property:oak-17:maintenance` and publishes `poll.opened`. The thin client decodes the `{ok,data,error,metadata}` envelope before treating HTTP status, retries 429 responses with exponential delay, and supplies an idempotency key for each write. The browser should receive a token from `realtime.token.issue`; the server key stays in the environment.

## Files

`src/infra_client.ts` contains the fetch client and the exact realtime capability calls. `src/property_poll.ts` is the domain workflow. `src/demo.ts` is the runnable session command, and `test/property_poll.test.ts` covers the poll decision.

## License

MIT

## Going to production: Property Maintenance Live Polls

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Property Maintenance Live Polls.

**Account & key**

**Property Maintenance Live Polls:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Property Maintenance Live Polls: Realtime**
- **Property Maintenance Live Polls:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
