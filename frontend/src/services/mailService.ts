/**
 * Centralized Mail Service (Stub for Resend/SMTP Integration)
 */

export async function sendLowStockAlert(productId: string, productTitle: string, currentStock: number) {
    if (currentStock > 1) return; // Only trigger at critical threshold
    
    console.log(`[ALERT]: Product ${productTitle} (ID: ${productId}) is low on stock! Current stock: ${currentStock}.`);
    // Example: Await resend.emails.send(...)
}

export async function sendOrderShippedEmail(customerEmail: string, orderId: string, trackingCode: string) {
    console.log(`[ALERT]: Order ${orderId} has shipped. Emailing ${customerEmail} with track & trace: ${trackingCode}.`);
    // Example: Await resend.emails.send(...)
}
