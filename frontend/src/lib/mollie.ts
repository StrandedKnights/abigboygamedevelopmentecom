import { createMollieClient } from '@mollie/api-client';

const apiKey = import.meta.env.MOLLIE_API_KEY;

if (!apiKey) {
    console.warn('[Mollie Client]: No MOLLIE_API_KEY found in .env. Mollie initialized with placeholder.');
}

/**
 * Centraal startpunt voor de Mollie API Client.
 * Gebruikt in zowel de checkout als de webhook routes om consistentie te garanderen.
 */
export const mollieClient = createMollieClient({
    apiKey: apiKey || 'test_dummy_key'
});

export default mollieClient;
