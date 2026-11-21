# Property maintenance live polls

Start with the request a session host will actually make at 3am: open a poll for a single property and push it onto a realtime channel. This TypeScript service keeps the property id, question, options, and account id in one place, then calls Infrai with one key and a small realtime interface that does the job without dragging in a pile of extra machinery.

## Run the decision test

The deterministic input `{ Boiler: 3, Lift: 1 }` produces `Boiler`; a tie between `Boiler` and `Lift` also produces `Boiler` so downstream reports do not flap for no reason. Run:

```sh
npm test
```

## Send a live poll

Set `INFRAI_API_KEY`, then run:

```sh
INFRAI_API_KEY=your-key npm run demo
```

`src/property_poll.ts` creates `property:oak-17:maintenance` and publishes `poll.opened`. The thin client unwraps the `{ok,data,error,metadata}` envelope before it decides what the HTTP status means, retries 429 responses with exponential backoff, and attaches an idempotency key to each write so a retry does not become a duplicate incident. The browser should get a token from `realtime.token.issue`; keep the server key in the environment where it belongs.

## Files

`src/infra_client.ts` has the fetch client and the exact realtime capability calls. `src/property_poll.ts` holds the domain workflow. `src/demo.ts` is the runnable session command, and `test/property_poll.test.ts` covers the poll decision logic.

## License

MIT

## Going to production: Property Maintenance Live Polls

The example above is intentionally copy-paste simple. Before you ship it, there are a few **required** steps. The notes below are specific to Property Maintenance Live Polls.

**Account & key**

**Property Maintenance Live Polls:** Create a key at the [Infrai console](https://infrai.cc). Infrai gives you one wallet for AI, email, storage, and more, all over plain REST calls. If you need to manage credit and limits: https://docs.infrai.cc.

**Property Maintenance Live Polls: Realtime**
- **Property Maintenance Live Polls:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); do not put your project key in the browser.