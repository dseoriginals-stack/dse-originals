import { Xendit } from "xendit-node"

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY,
})

const { Invoice } = xendit

export async function createInvoice({
  external_id,
  amount,
  payer_email,
  description,
}) {
  const invoice = await Invoice.createInvoice({
    data: {
      externalId: external_id,
      amount: amount,
      payerEmail: payer_email,
      description: description,
      currency: "PHP",
      successRedirectUrl: `${process.env.FRONTEND_URL}/order-success/${external_id}`,
      failureRedirectUrl: `${process.env.FRONTEND_URL}/checkout`,
    },
  })

  return invoice
}

export default xendit