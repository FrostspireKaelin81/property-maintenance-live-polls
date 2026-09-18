import { openMaintenancePoll } from "./property_poll.ts";

const poll = await openMaintenancePoll({ propertyId: "oak-17", question: "Which repair is urgent?", options: ["Boiler", "Lift"], accountId: "property-team" });
console.log(JSON.stringify(poll));
