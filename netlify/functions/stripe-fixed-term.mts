import type { Config } from '@netlify/functions';
import { handleWebhook } from './_shared/webhook-handler.mts';

export default async function (request: Request) {
  return handleWebhook(request, {
    key: Netlify.env.get('SUS_STRIPE_RESTRICTED_KEY'),
    secret: Netlify.env.get('SUS_STRIPE_WEBHOOK_SECRET'),
    policy: {
      price: Netlify.env.get('SUS_STRIPE_MANAGED_PRICE_ID') ?? '',
      paymentLink: Netlify.env.get('SUS_STRIPE_MANAGED_LINK_ID') ?? '',
      livemode: Netlify.env.get('SUS_STRIPE_LIVEMODE') === 'true',
    },
  });
}

export const config: Config = { path: '/api/stripe/fixed-term' };
