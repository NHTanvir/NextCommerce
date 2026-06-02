export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function orderPlacedTemplate(orderId: string, totalCents: number): EmailTemplate {
  const total = (totalCents / 100).toFixed(2);
  const shortId = orderId.slice(-8).toUpperCase();

  return {
    subject: `Order Confirmed #${shortId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e94560;">Order Confirmed!</h2>
        <p>Thank you for your order. Here are your order details:</p>
        <table>
          <tr><td><strong>Order ID:</strong></td><td>#${shortId}</td></tr>
          <tr><td><strong>Total:</strong></td><td>$${total}</td></tr>
        </table>
        <p>You will receive a shipping notification once your order is dispatched.</p>
        <a href="https://nextcommerce.io/account/orders" style="background:#e94560;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px;">
          View Order
        </a>
      </div>
    `.trim(),
    text: `Order Confirmed #${shortId}\n\nTotal: $${total}\n\nView your order at https://nextcommerce.io/account/orders`,
  };
}

export function orderPaidTemplate(orderId: string): EmailTemplate {
  const shortId = orderId.slice(-8).toUpperCase();
  return {
    subject: `Payment Received for Order #${shortId}`,
    html: `<p>Your payment for order <strong>#${shortId}</strong> has been received. We are now processing your order.</p>`,
    text: `Payment received for order #${shortId}. We are now processing your order.`,
  };
}

export function orderShippedTemplate(orderId: string, trackingNumber?: string): EmailTemplate {
  const shortId = orderId.slice(-8).toUpperCase();
  const tracking = trackingNumber ? `\nTracking: ${trackingNumber}` : '';
  return {
    subject: `Your Order #${shortId} Has Shipped!`,
    html: `
      <p>Great news! Your order <strong>#${shortId}</strong> is on its way.</p>
      ${trackingNumber ? `<p>Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
    `.trim(),
    text: `Order #${shortId} shipped.${tracking}`,
  };
}

export function newsletterWelcomeTemplate(email: string): EmailTemplate {
  return {
    subject: 'Welcome to NextCommerce — You\'re In!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e94560;">Welcome to NextCommerce!</h2>
        <p>Thanks for subscribing with <strong>${email}</strong>.</p>
        <p>You'll receive exclusive deals, early access to sales, and new drop notifications.</p>
        <a href="https://nextcommerce.io/products" style="background:#e94560;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:16px;">
          Shop Now
        </a>
      </div>
    `.trim(),
    text: `Welcome to NextCommerce! You've subscribed with ${email}. Shop at https://nextcommerce.io/products`,
  };
}
