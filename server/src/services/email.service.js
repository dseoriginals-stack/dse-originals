import { Resend } from 'resend'

/*
-----------------------------------
TRANSPORT
-----------------------------------
*/

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set. Email not sent:", subject)
    return
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'DSEoriginals <onboarding@resend.dev>', // Users should update this to their verified domain
      to,
      subject,
      html
    })
    return data
  } catch (error) {
    console.error("Failed to send email via Resend:", error)
    throw error
  }
}

/*
-----------------------------------
BASE TEMPLATE (PREMIUM UI)
-----------------------------------
*/

export const baseTemplate = (content) => `
  <div style="background:#f1f5f9;padding:40px 0;font-family:Arial,sans-serif;">
    
    <div style="max-width:600px;margin:auto;background:white;border-radius:16px;overflow:hidden;">

      <!-- HEADER -->
      <div style="background:#274C77;color:white;padding:20px 30px;">
        <h2 style="margin:0;">DSEoriginals</h2>
      </div>

      <!-- BODY -->
      <div style="padding:30px;">
        ${content}
      </div>

      <!-- FOOTER -->
      <div style="background:#f8fafc;padding:20px 30px;font-size:12px;color:#64748b;">
        <p style="margin:0;">Need help? Contact support anytime.</p>
        <p style="margin-top:6px;">© ${new Date().getFullYear()} DSEoriginals</p>
      </div>

    </div>

  </div>
`

/*
-----------------------------------
PRODUCT LIST HTML
-----------------------------------
*/

const renderItems = (items = []) => {
  return items.map(item => `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
      <span>${item.productName} × ${item.quantity}</span>
      <strong>₱${Number(item.price * item.quantity).toLocaleString()}</strong>
    </div>
  `).join("")
}

/*
-----------------------------------
BUTTON
-----------------------------------
*/

const button = (label, url) => `
  <a href="${url}"
     style="
       display:inline-block;
       margin-top:20px;
       padding:12px 20px;
       background:#274C77;
       color:white;
       border-radius:8px;
       text-decoration:none;
       font-weight:600;
     ">
     ${label}
  </a>
`

/*
-----------------------------------
ORDER PLACED EMAIL (INITIAL)
-----------------------------------
*/

export const sendOrderPlacedEmail = async (to, order) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">✨</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">Order Received</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">We've received your order and it's being processed.</p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
       <p style="color: #1e293b; font-size: 16px; font-weight: 700; margin: 0;">Order #${order.id.slice(-6).toUpperCase()}</p>
       <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Status: ${order.status.toUpperCase()}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Summary of Items</h3>
      ${renderItems(order.items || [])}
    </div>

    <div style="text-align: center;">
       <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">You'll receive another email once your payment is confirmed or when your order ships.</p>
       ${button("View Order Details", `${process.env.CLIENT_URL}/orders/${order.id}`)}
    </div>
  `

  await sendEmail({
    to,
    subject: `Order Received: #${order.id.slice(-6).toUpperCase()}`,
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
ORDER PAID EMAIL
-----------------------------------
*/

export const sendOrderPaidEmail = async (to, order) => {

  const content = `
    <h2 style="margin-top:0;">🎉 Payment Confirmed</h2>

    <p>Your order has been successfully paid.</p>

    <div style="margin:20px 0;">
      <strong>Order ID:</strong> ${order.id}<br/>
      <strong>Total:</strong> ₱${Number(order.total).toLocaleString()}
    </div>

    <hr style="margin:20px 0"/>

    <h3>Items</h3>

    ${renderItems(order.items || [])}

    ${button("View Order", `${process.env.CLIENT_URL}/orders/${order.id}`)}
  `

  await sendEmail({
    to,
    subject: "Payment Confirmed",
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
SHIPPED EMAIL
-----------------------------------
*/

export const sendShippedEmail = async (to, order) => {
  const trackingLink = order.trackingNo
    ? `https://www.jtexpress.ph/index/query/gzquery.html?bills=${order.trackingNo}`
    : `${process.env.CLIENT_URL}/track?id=${order.id}&email=${to}`

  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">🚚</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">Your Order is En Route</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Package successfully dispatched from our warehouse</p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
      <div style="margin-bottom: 15px;">
        <span style="display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Logistics Partner</span>
        <strong style="font-size: 16px; color: #274C77;">J&T Express Philippines</strong>
      </div>
      
      <div style="margin-bottom: 15px;">
        <span style="display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</span>
        <code style="font-size: 18px; color: #1e293b; font-weight: 800; font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">${order.trackingNo || 'Processing...'}</code>
      </div>

      <div>
        <span style="display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Shipment ID</span>
        <span style="font-size: 13px; color: #64748b;">${order.id}</span>
      </div>
    </div>

    <div style="text-align: center;">
       <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Use the button below to track your live shipment status on the J&T portal or our guest tracking page.</p>
       ${button("Track My Shipment", trackingLink)}
    </div>

    <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Shipment Contents</h3>
      ${renderItems(order.items || [])}
    </div>
  `

  await sendEmail({
    to,
    subject: `Tracking Updated for Order #${order.id.slice(-6).toUpperCase()}`,
    html: baseTemplate(content)
  })
}
/*
-----------------------------------
ABANDONED CART EMAIL (RECOVERY)
-----------------------------------
*/

export const sendAbandonedCartEmail = async (to, cart, recoveryUrl) => {

  const items = cart.items.map(item => ({
    productName: item.variant.product.name,
    quantity: item.quantity,
    price: item.variant.price
  }))

  const content = `
    <h2 style="margin-top:0;">🛒 You Left Something Behind</h2>

    <p>Your cart is waiting for you. Complete your purchase before items run out.</p>

    <div style="margin:20px 0;">
      <strong>Items in your cart:</strong>
    </div>

    ${renderItems(items)}

    ${button("Restore Cart", recoveryUrl)}
  `

  await sendEmail({
    to,
    subject: "Complete your order before it's gone",
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
DELIVERED EMAIL
-----------------------------------
*/

export const sendDeliveredEmail = async (to, order) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">🎁</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">Delivered & Ready to Wear!</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your DSEoriginals package has matching its destination</p>
    </div>

    <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; border: 1px solid #bbf7d0; margin-bottom: 30px; text-align: center;">
       <p style="color: #166534; font-size: 16px; font-weight: 700; margin: 0;">Order #${order.id.slice(-6).toUpperCase()} is now at your doorstep.</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Summary of Items</h3>
      ${renderItems(order.items || [])}
    </div>

    <div style="text-align: center; background: #f8fafc; border-radius: 12px; padding: 25px;">
       <h4 style="margin: 0; color: #1e293b;">How do you like your new scent?</h4>
       <p style="font-size: 13px; color: #64748b; margin-top: 8px;">Your feedback helps our artisans continue to grow.</p>
       ${button("Leave a Review", `${process.env.CLIENT_URL}/orders/${order.id}#reviews`)}
    </div>

    <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
      If you didn't receive this package, please contact our support team immediately.
    </p>
  `

  await sendEmail({
    to,
    subject: `Delivered: Your DSEoriginals Order #${order.id.slice(-6).toUpperCase()}`,
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
READY FOR PICKUP EMAIL
-----------------------------------
*/

export const sendReadyForPickupEmail = async (to, order) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">🛍️</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">Ready for Pickup!</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your DSEoriginals order is prepared and waiting for you.</p>
    </div>

    <div style="background: #f0f9ff; border-radius: 12px; padding: 25px; border: 1px solid #bae6fd; margin-bottom: 30px; text-align: center;">
       <p style="color: #0369a1; font-size: 16px; font-weight: 700; margin: 0;">Order #${order.id.slice(-6).toUpperCase()} is ready at our branch.</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Pickup Details</h3>
      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        <strong>Location:</strong> DSEoriginals Main Branch<br/>
        <strong>Order ID:</strong> ${order.id}<br/>
        <strong>Items:</strong> ${order.items?.length || 0} items
      </p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 25px;">
       <h4 style="margin: 0; color: #1e293b;">Items to Collect:</h4>
       <div style="margin-top: 15px;">
         ${renderItems(order.items || [])}
       </div>
    </div>

    <p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 30px;">
      Please present this email or your Order ID when you arrive.
    </p>
  `

  await sendEmail({
    to,
    subject: `Ready for Pickup: Order #${order.id.slice(-6).toUpperCase()}`,
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
REVIEW REQUEST EMAIL
-----------------------------------
*/

export const sendReviewRequestEmail = async (to, order, unreviewedItems) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">⭐</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">How are you loving it?</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">We hope you're enjoying your recent purchase.</p>
    </div>

    <div style="background: #f8fafc; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; margin-bottom: 30px; text-align: center;">
       <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.6;">
         Your feedback is incredibly valuable to our artisan community and helps other shoppers find their perfect scent.
       </p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Your Unreviewed Items</h3>
      ${unreviewedItems.map(item => `
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;padding:10px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;">
          <span style="font-weight:600;color:#334155;">${item.productName}</span>
        </div>
      `).join("")}
    </div>

    <div style="text-align: center;">
       ${button("Leave a Review", `${process.env.CLIENT_URL}/orders/${order.id}#reviews`)}
    </div>

    <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 30px;">
      As a thank you, leaving a photo review earns you 50 extra Lucky Points!
    </p>
  `

  await sendEmail({
    to,
    subject: "How was your recent purchase? ⭐",
    html: baseTemplate(content)
  })
}

/*
-----------------------------------
ORDER CANCELED EMAIL
-----------------------------------
*/

export const sendOrderCanceledEmail = async (to, order) => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 50px; margin-bottom: 10px;">🛑</div>
      <h2 style="margin: 0; font-size: 24px; color: #1e293b; font-weight: 800;">Order Canceled</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your order #${order.id.slice(-6).toUpperCase()} has been canceled.</p>
    </div>

    <div style="background: #fef2f2; border-radius: 12px; padding: 25px; border: 1px solid #fee2e2; margin-bottom: 30px; text-align: center;">
       <p style="color: #991b1b; font-size: 16px; font-weight: 700; margin: 0;">We've processed the cancellation for your request.</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 14px; color: #1e293b; margin-bottom: 15px;">Summary of Items</h3>
      ${renderItems(order.items || [])}
    </div>

    <p style="text-align: center; font-size: 13px; color: #64748b; margin-top: 30px;">
      If this was a mistake or you have questions about your refund (if applicable), please contact our support team.
    </p>

    <div style="text-align: center;">
       ${button("Return to Shop", `${process.env.CLIENT_URL}/products`)}
    </div>
  `

  await sendEmail({
    to,
    subject: `Order Canceled: #${order.id.slice(-6).toUpperCase()}`,
    html: baseTemplate(content)
  })
}
