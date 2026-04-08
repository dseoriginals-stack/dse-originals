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
      external_id,
      amount,
      payer_email,
      description,
      currency: "PHP",
      success_redirect_url: `${process.env.CLIENT_URL}/order-success/${external_id}`,
      failure_redirect_url: `${process.env.CLIENT_URL}/checkout`,
    },
  })

  return invoice
}

export default xendit