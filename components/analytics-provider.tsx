"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function filterAnalyticsEvent(event: BeforeSendEvent) {
  if (
    event.url.includes("/author") ||
    event.url.includes("/auth/") ||
    event.url.includes("/me/")
  ) {
    return null;
  }

  return event;
}

export function AnalyticsProvider() {
  return <Analytics beforeSend={filterAnalyticsEvent} />;
}
