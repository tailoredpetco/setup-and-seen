import Stripe from 'stripe';
import { enforceFixedTerm, type Policy } from './fixed-term.mts';

type Dependencies = {
  key: string | undefined;
  secret: string | undefined;
  policy: Policy;
  client?: Stripe;
};

export async function handleWebhook(request: Request, dependencies: Dependencies) {
  const reply = (message: string, status: number) => new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
  if (request.method !== 'POST') return reply('Method not allowed', 405);
  const { key, secret, policy } = dependencies;
  if (!key || !secret || !policy.price || !policy.paymentLink) return reply('Billing is not configured', 503);
  const signature = request.headers.get('stripe-signature');
  if (!signature) return reply('Invalid signature', 400);
  const body = await request.text();
  if (body.length > 512000) return reply('Request too large', 413);
  const stripe = dependencies.client ?? new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret, 300);
  } catch {
    return reply('Invalid signature', 400);
  }
  try {
    await enforceFixedTerm(stripe, event, policy);
    return reply('Received', 200);
  } catch {
    // Stripe retries unsuccessful deliveries. Never return a successful
    // acknowledgement when the billing limit could not be verified.
    // Do not log the request, customer information, secrets or Stripe errors.
    return reply('Billing configuration requires retry or review', 500);
  }
}
