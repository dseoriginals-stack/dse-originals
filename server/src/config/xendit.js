import { Xendit, Invoice } from "xendit-node"

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY?.replace(/['"]/g, "").trim(),
})

const invoiceClient = new Invoice({ xenditClient: xendit })

export async function createInvoice({
  external_id,
  amount,
  payer_email,
  description,
  success_url,
  failure_url,
}) {
  const invoice = await invoiceClient.createInvoice({
    data: {
      externalId: external_id,
      amount: amount,
      payerEmail: payer_email,
      description: description,
      currency: "PHP",
      successRedirectUrl: success_url || `${process.env.FRONTEND_URL}/order-success/${external_id}`,
      failureRedirectUrl: failure_url || `${process.env.FRONTEND_URL}/checkout`,
    },
  })

  return invoice
}

export default xendit