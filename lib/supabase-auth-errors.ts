/**
 * Maps Supabase Auth API messages to concise, user-facing copy.
 */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase();

  if (
    m.includes("already registered") ||
    m.includes("user already registered") ||
    m.includes("email address is already registered")
  ) {
    return "Email already in use.";
  }

  if (
    m.includes("invalid login credentials") ||
    m.includes("invalid email or password")
  ) {
    return "Invalid email or password.";
  }

  if (m.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (m.includes("password")) {
    return message.length < 120 ? message : "Password does not meet requirements.";
  }

  if (m.includes("invalid email")) {
    return "Enter a valid email address.";
  }

  return message || "Something went wrong. Please try again.";
}
