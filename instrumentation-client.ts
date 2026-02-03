import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4fb1319c553b5b586efa665813046965@o4509395283542016.ingest.de.sentry.io/4510823107067984",
  enableLogs: true,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
