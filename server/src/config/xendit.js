import { Xendit } from "xendit-node"

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY?.replace(/['"]/g, "").trim(),
})

// In v7, sub-clients are directly attached to the Xendit instance
const invoiceClient = xendit.Invoice

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
      amount: Number(amount),
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