import PDFDocument from 'pdfkit';
import { Writable } from 'stream';
import Order, { IOrder } from '../models/Order';
import Store from '../models/Store';
import { AppError } from '../middleware/errorHandler';

export class PdfService {
  // generate a PDF invoice for an order and return as Buffer
  async generateInvoice(order: IOrder): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      const writable = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      });

      doc.pipe(writable);
      writable.on('finish', () => resolve(Buffer.concat(chunks)));
      writable.on('error', reject);

      this.renderInvoice(doc, order);

      doc.end();
    });
  }

  private renderInvoice(doc: PDFKit.PDFDocument, order: IOrder): void {
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100;

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
    doc.fontSize(10).font('Helvetica').text(`Invoice #${order.orderNumber}`, 50, 80);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`, 50, 95);
    doc.text(`Status: ${order.isPaid ? 'PAID' : 'UNPAID'}`, 50, 110);

    // Seller info (top right)
    doc.fontSize(10).font('Helvetica-Bold').text('From:', pageWidth - 250, 50);
    doc.font('Helvetica').text('E-Shop Marketplace', pageWidth - 250, 65);
    doc.text('123 Commerce Street', pageWidth - 250, 80);
    doc.text('Mumbai, India 400001', pageWidth - 250, 95);
    doc.text('GSTIN: 27ABCDE1234F1Z5', pageWidth - 250, 110);

    // Bill to
    doc.moveTo(50, 140).lineTo(pageWidth - 50, 140).stroke();
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, 155);
    doc.font('Helvetica').text(`Order: ${order.orderNumber}`, 50, 170);
    doc.text(`Ship to: ${order.shippingAddress.address}`, 50, 185);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 50, 200);
    doc.text(order.shippingAddress.country, 50, 215);

    // Items table
    const tableTop = 250;
    doc.font('Helvetica-Bold').text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 360, tableTop);
    doc.text('Total', 440, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(pageWidth - 50, tableTop + 15).stroke();

    let y = tableTop + 30;
    doc.font('Helvetica');
    order.orderItems.forEach((item) => {
      doc.text(item.name, 50, y, { width: 240 });
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`$${item.price.toFixed(2)}`, 360, y);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 440, y);
      y += 20;
    });

    // Totals
    y += 20;
    doc.moveTo(300, y).lineTo(pageWidth - 50, y).stroke();
    y += 15;
    doc.font('Helvetica');
    doc.text('Items Subtotal:', 300, y);
    doc.text(`$${(order.itemsPrice || 0).toFixed(2)}`, 440, y);
    y += 20;
    doc.text('Tax:', 300, y);
    doc.text(`$${order.taxPrice.toFixed(2)}`, 440, y);
    y += 20;
    doc.text('Shipping:', 300, y);
    doc.text(`$${order.shippingPrice.toFixed(2)}`, 440, y);

    if (order.discountPrice > 0) {
      y += 20;
      doc.text('Discount:', 300, y);
      doc.text(`-$${order.discountPrice.toFixed(2)}`, 440, y);
    }

    if (order.appliedCoupon) {
      y += 15;
      doc.fontSize(8).fillColor('#666666').text(`Coupon: ${order.appliedCoupon.code}`, 300, y);
      doc.fontSize(10).fillColor('#000000');
    }

    y += 30;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', 300, y);
    doc.text(`$${order.totalPrice.toFixed(2)}`, 440, y);

    // Footer
    doc.font('Helvetica').fontSize(8).fillColor('#999999');
    doc.text(
      'This is a computer-generated invoice and does not require a signature.',
      50,
      doc.page.height - 50,
      { align: 'center', width: contentWidth }
    );
  }

  // get order and verify ownership before generating invoice
  async generateInvoiceForUser(orderId: string, userId: string, isAdmin: boolean): Promise<Buffer> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (!isAdmin && order.user.toString() !== userId) {
      throw new AppError('Not authorized to view this invoice', 403);
    }

    return this.generateInvoice(order);
  }
}

export default new PdfService();
