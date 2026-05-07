import PDFDocument from "pdfkit"
import prisma from "../config/prisma.js"

export const generateOrderReceipt = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              attributes: true
            }
          }
        }
      },
      user: true,
      address: true
    }
  })

  if (!order) throw new Error("Order not found")

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" })
    const buffers = []

    doc.on("data", (chunk) => buffers.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(buffers)))
    doc.on("error", (err) => reject(err))

    // ==========================================
    // HEADER
    // ==========================================
    doc.fillColor("#274C77").fontSize(24).text("DSE ORIGINALS", { align: "left" })
    doc.fillColor("#64748B").fontSize(10).text("Official Purchase Receipt", { align: "left" })
    
    doc.moveDown()
    
    // Store Info
    doc.fillColor("#1E293B").fontSize(10).text("DSE Originals Store", { align: "right" })
    doc.text("Philippines", { align: "right" })
    doc.text("support@dseoriginals.com", { align: "right" })
    doc.text("www.dseoriginals.com", { align: "right" })

    doc.moveDown()
    doc.rect(50, doc.y, 500, 1).fill("#E2E8F0")
    doc.moveDown()

    // ==========================================
    // ORDER INFO
    // ==========================================
    const orderTop = doc.y
    doc.fillColor("#64748B").fontSize(10).text("ORDER ID", 50, orderTop)
    doc.fillColor("#1E293B").fontSize(12).text(`#${order.id.slice(0, 8).toUpperCase()}`, 50, orderTop + 15)

    doc.fillColor("#64748B").fontSize(10).text("DATE", 200, orderTop)
    doc.fillColor("#1E293B").fontSize(12).text(new Date(order.createdAt).toLocaleDateString(), 200, orderTop + 15)

    doc.fillColor("#64748B").fontSize(10).text("PAYMENT", 350, orderTop)
    doc.fillColor("#1E293B").fontSize(12).text("PAID (XENDIT)", 350, orderTop + 15)

    doc.moveDown(3)

    // ==========================================
    // CUSTOMER & DELIVERY
    // ==========================================
    const deliveryTop = doc.y
    doc.fillColor("#274C77").fontSize(12).text("CUSTOMER DETAILS", 50, deliveryTop)
    doc.fillColor("#1E293B").fontSize(10).text(order.user?.name || order.guestName || "Guest Customer", 50, deliveryTop + 20)
    doc.text(order.user?.email || order.guestEmail || "", 50, deliveryTop + 35)
    doc.text(order.user?.phone || order.guestPhone || "", 50, deliveryTop + 50)

    doc.fillColor("#274C77").fontSize(12).text("DELIVERY METHOD", 300, deliveryTop)
    if (order.deliveryMethod === "pickup") {
      doc.fillColor("#F59E0B").fontSize(11).text("STORE PICKUP", 300, deliveryTop + 20)
      doc.fillColor("#1E293B").fontSize(9).text("Please present this receipt at the counter.", 300, deliveryTop + 35)
      doc.text("Location: DSE Originals Official Store", 300, deliveryTop + 48)
    } else {
      doc.fillColor("#3B82F6").fontSize(11).text("STANDARD SHIPPING", 300, deliveryTop + 20)
      if (order.address) {
        doc.fillColor("#1E293B").fontSize(9).text(`${order.address.street}, ${order.address.barangay}`, 300, deliveryTop + 35)
        doc.text(`${order.address.city}, ${order.address.province}`, 300, deliveryTop + 48)
      }
    }

    doc.moveDown(4)

    // ==========================================
    // ITEMS TABLE
    // ==========================================
    const tableTop = doc.y
    doc.fillColor("#64748B").fontSize(10)
    doc.text("ITEM DESCRIPTION", 50, tableTop)
    doc.text("QTY", 300, tableTop)
    doc.text("PRICE", 380, tableTop)
    doc.text("TOTAL", 480, tableTop)

    doc.moveDown()
    doc.rect(50, doc.y, 500, 1).fill("#F1F5F9")
    doc.moveDown()

    order.items.forEach((item, i) => {
      const y = doc.y
      
      // Description with Variant Attributes
      doc.fillColor("#1E293B").fontSize(10).text(item.name, 50, y)
      if (item.variant?.attributes) {
        const attrString = item.variant.attributes.map(a => `${a.name}: ${a.value}`).join(" | ")
        doc.fillColor("#64748B").fontSize(8).text(attrString, 50, y + 12)
      }

      doc.fillColor("#1E293B").fontSize(10).text(item.quantity.toString(), 300, y)
      doc.text(`₱${Number(item.price).toLocaleString()}`, 380, y)
      doc.text(`₱${(item.quantity * Number(item.price)).toLocaleString()}`, 480, y)

      doc.moveDown(2)
    })

    doc.moveDown()
    doc.rect(50, doc.y, 500, 1).fill("#E2E8F0")
    doc.moveDown()

    // ==========================================
    // TOTALS
    // ==========================================
    const totalsTop = doc.y
    const labelX = 350
    const valueX = 480

    doc.fillColor("#64748B").fontSize(10).text("Subtotal:", labelX, totalsTop)
    doc.fillColor("#1E293B").text(`₱${Number(order.totalAmount - (order.shippingFee || 0) + (order.pointsDiscount || 0)).toLocaleString()}`, valueX, totalsTop)

    doc.fillColor("#64748B").text("Shipping Fee:", labelX, totalsTop + 20)
    doc.fillColor("#1E293B").text(`₱${Number(order.shippingFee || 0).toLocaleString()}`, valueX, totalsTop + 20)

    if (order.pointsDiscount > 0) {
      doc.fillColor("#1E293B").text("Points Discount:", labelX, totalsTop + 40)
      doc.fillColor("#EF4444").text(`-₱${Number(order.pointsDiscount).toLocaleString()}`, valueX, totalsTop + 40)
    }

    doc.moveDown()
    doc.rect(350, doc.y + 10, 200, 1).fill("#274C77")
    doc.moveDown()

    doc.fillColor("#274C77").fontSize(14).text("TOTAL PAID:", labelX, doc.y + 15)
    doc.text(`₱${Number(order.totalAmount).toLocaleString()}`, valueX, doc.y + 15)

    // ==========================================
    // FOOTER
    // ==========================================
    doc.fontSize(8).fillColor("#94A3B8")
      .text("Thank you for choosing DSE Originals. This receipt is computer-generated and does not require a signature.", 50, 750, { align: "center" })

    doc.end()
  })
}
