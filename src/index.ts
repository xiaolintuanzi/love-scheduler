import { Hono } from "hono";
import { runJob } from "./job/runJob";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("ok"));

export default {
  fetch: app.fetch,
  scheduled: (
    event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext
  ) => {
    ctx.waitUntil(
      runJob(env, event.scheduledTime).catch((error) => {
        console.error("Scheduled job failed", error);
      })
    );
  },
};
