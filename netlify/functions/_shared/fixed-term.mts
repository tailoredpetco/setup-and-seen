import type Stripe from 'stripe';

export type Policy = {
  paymentLink: string;
  price: string;
  livemode: boolean;
};

export function policyVersion() {
  return 'sus-managed-12-months-v1';
}

function objectId(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') return value.id;
  return null;
}

function assertFixedSchedule(schedule: Stripe.SubscriptionSchedule, policy: Policy, start: number) {
  const phase = schedule.phases[0];
  const beginning = new Date(start * 1000);
  const end = new Date((phase?.end_date ?? 0) * 1000);
  const expected = new Date(beginning);
  expected.setUTCFullYear(beginning.getUTCFullYear() + 1, beginning.getUTCMonth(), 1);
  const lastDay = new Date(Date.UTC(expected.getUTCFullYear(), expected.getUTCMonth() + 1, 0)).getUTCDate();
  expected.setUTCDate(Math.min(beginning.getUTCDate(), lastDay));
  if (schedule.end_behavior !== 'cancel' || schedule.phases.length !== 1 ||
      phase.start_date !== start || end.getTime() !== expected.getTime() ||
      phase.items.length !== 1 || objectId(phase.items[0].price) !== policy.price ||
      phase.items[0].quantity !== 1) throw new Error('FIXED_TERM_NOT_CONFIRMED');
}

export async function enforceFixedTerm(
  stripe: Pick<Stripe, 'subscriptions' | 'subscriptionSchedules'>,
  event: Stripe.Event,
  policy: Policy,
) {
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    return { state: 'ignored' };
  }
  const session = event.data.object as Stripe.Checkout.Session;
  if (objectId(session.payment_link) !== policy.paymentLink) return { state: 'ignored' };
  if (event.livemode !== policy.livemode || session.livemode !== policy.livemode) {
    throw new Error('WRONG_STRIPE_MODE');
  }
  const subscriptionId = objectId(session.subscription);
  if (session.mode !== 'subscription' || session.status !== 'complete' || !subscriptionId ||
      session.currency !== 'gbp' || session.amount_total !== 14900) {
    throw new Error('UNEXPECTED_CHECKOUT');
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (['canceled', 'incomplete_expired'].includes(subscription.status)) return { state: 'ended' };
  const item = subscription.items.data[0];
  if (subscription.livemode !== policy.livemode || subscription.items.data.length !== 1 ||
      !item || item.price.id !== policy.price || item.quantity !== 1 ||
      item.price.currency !== 'gbp' || item.price.unit_amount !== 14900 ||
      item.price.recurring?.interval !== 'month' || item.price.recurring.interval_count !== 1 ||
      subscription.trial_end || subscription.automatic_tax.enabled ||
      subscription.discounts.length || subscription.default_tax_rates?.length ||
      item.tax_rates?.length || item.discounts?.length ||
      subscription.metadata.sus_fixed_term !== policyVersion()) {
    throw new Error('UNEXPECTED_SUBSCRIPTION');
  }
  const start = subscription.billing_cycle_anchor;
  if (!Number.isSafeInteger(start) || start <= 0) throw new Error('INVALID_BILLING_ANCHOR');
  const existingId = objectId(subscription.schedule);
  if (existingId) {
    const existing = await stripe.subscriptionSchedules.retrieve(existingId);
    if (existing.metadata?.sus_fixed_term === policyVersion()) {
      assertFixedSchedule(existing, policy, start);
      return { state: 'already_configured' };
    }
  }

  // The same key recovers a create that succeeded before a later update failed.
  // If a different, manually created schedule is attached, Stripe rejects this
  // request. Do not overwrite an unrecognised schedule.
  const schedule = await stripe.subscriptionSchedules.create(
    { from_subscription: subscriptionId },
    { idempotencyKey: policyVersion() + '-create-' + subscriptionId },
  );
  if (existingId && schedule.id !== existingId) throw new Error('UNEXPECTED_SCHEDULE');
  if (schedule.phases.length !== 1 || schedule.phases[0].start_date !== start) {
    throw new Error('SCHEDULE_NOT_AT_ORIGINAL_START');
  }
  const updated = await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: 'cancel',
    proration_behavior: 'none',
    metadata: {
      sus_fixed_term: policyVersion(),
      sus_billing_periods: '12',
      sus_total_gbp: '1788',
    },
    phases: [{
      start_date: start,
      duration: { interval: 'month', interval_count: 12 },
      items: [{ price: policy.price, quantity: 1 }],
      proration_behavior: 'none',
      automatic_tax: { enabled: false },
    }],
  }, { idempotencyKey: policyVersion() + '-configure-' + subscriptionId });
  assertFixedSchedule(updated, policy, start);
  return { state: 'configured' };
}
