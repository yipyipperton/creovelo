import { handleContactRequest } from "../_lib/contact.js";

export async function onRequest(context) {
  return handleContactRequest(context.request, context.env);
}
