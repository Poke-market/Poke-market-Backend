import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "../config/env";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.

  key: ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }), // voor development best op dry run

    // Bot detection in DRY_RUN mode to avoid blocking legitimate traffic
    detectBot({
      mode: "DRY_RUN", // Only logs, doesn't block
      allow: [
        // "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // "CATEGORY:MONITOR", // Uptime monitoring services
        // "CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),

    // More aggressive token bucket rate limit for testing
    tokenBucket({
      mode: "LIVE",
      refillRate: 30, // Only 1 token per interval (super strict for testing)
      interval: 5, // Shorter interval of 5 seconds
      capacity: 30, // Very small burst capacity
    }),
  ],
});

export default aj;
