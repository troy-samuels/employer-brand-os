/**
 * @module app/(auth)/login/page
 * Module implementation for page.tsx.
 */

import { redirect } from "next/navigation";

/**
 * Executes LoginPage.
 * @returns The resulting value.
 */
export default function LoginPage() {
  redirect("/");
}
