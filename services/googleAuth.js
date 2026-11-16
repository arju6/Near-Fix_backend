import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();
export async function verifyGoogleCredential(credential) {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || !payload.email_verified)
    throw new Error("Unverified Google identity");
  return payload;
}
