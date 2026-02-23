/**
 * @module lib/email/resend
 * Resend email client wrapper with graceful fallback when no API key is set.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || "OpenRole <hello@mail.openrole.co.uk>";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY is not set — emails will not be sent."
    );
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends an email via Resend.
 * Returns gracefully with success: false if no API key is configured.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const client = getClient();

  if (!client) {
    return {
      success: false,
      error: "Email client not configured (missing RESEND_API_KEY)",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: options.from ?? DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      console.error("[email] Resend error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Unexpected error:", message);
    return { success: false, error: message };
  }
}
