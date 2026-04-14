import nodemailer from "nodemailer"

/*
-----------------------------------
TRANSPORT
-----------------------------------
*/

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

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

  await transporter.sendMail({
    from: `"DSEoriginals" <${process.env.EMAIL_USER}>`,
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

  await transporter.sendMail({
    from: `"DSEoriginals" <${process.env.EMAIL_USER}>`,
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

  await transporter.sendMail({
    from: `"DSEoriginals" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Complete your order before it's gone",
    html: baseTemplate(content)
  })
}