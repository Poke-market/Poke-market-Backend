import { NextFunction, Request, Response } from "express";
import aj from "../config/arcjet";
import { TooManyRequestError, ForbiddenError } from "../errors";

const arcjetMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    // Log full details about the decision
    console.log(
      `Arcjet decision: ${decision.isDenied() ? "DENIED" : "ALLOWED"} for IP: ${req.ip}`,
    );
    if (decision.isDenied()) {
      console.log(
        `Denial reason: ${
          decision.reason.isRateLimit()
            ? "RATE_LIMIT"
            : decision.reason.isBot()
              ? "BOT"
              : "OTHER"
        }`,
      );
    }

    // If the decision is explicitly allowed, proceed to the next middleware
    if (decision.isAllowed()) {
      return next();
    }

    // Handle denied requests by specific reason
    if (decision.isDenied()) {
      // For rate limit detections, enforce strictly - this is our priority
      if (decision.reason.isRateLimit()) {
        console.log(`⛔ RATE LIMIT EXCEEDED for IP: ${req.ip} ⛔`);
        throw new TooManyRequestError(
          "Rate limit exceeded. Please try again later.",
        );
      }

      // For bot detections, allow legitimate browser traffic through
      if (decision.reason.isBot()) {
        console.log(`🤖 Bot detection triggered for IP: ${req.ip} 🤖`);

        // Check if request has characteristics of a legitimate browser
        const hasUserAgent = req.headers["user-agent"] !== undefined;
        const hasAcceptHeader = req.headers.accept !== undefined;

        // If it has common browser headers, let it through
        if (hasUserAgent && hasAcceptHeader) {
          console.log("Request has browser characteristics - allowing");
          return next();
        }

        // Otherwise block as a bot
        throw new ForbiddenError(
          "Nah, nice try but you're not getting in you mr Bot we only allow humans",
        );
      }

      throw new ForbiddenError("Forbidden to enter, but nice try though");
    }

    // If the decision is neither allowed nor denied (e.g., it's in a "monitor" mode),
    // we'll let the request through as a default behavior
    next();
  } catch (error: unknown) {
    // If Arcjet service is unavailable, fail open for better user experience
    if (error instanceof Error && error.message.includes("Arcjet")) {
      console.error("Arcjet service error:", error);
      return next();
    }
    next(error);
  }
};

export default arcjetMiddleware;
