import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const { recipients, smtpConfig, receiptData } = await req.json();

    if (!recipients) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      return NextResponse.json({ error: 'Falta configuración SMTP en los Ajustes.' }, { status: 400 });
    }

    // Configurar transporte nodemailer con las credenciales SMTP del usuario
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port) || 587,
      secure: parseInt(smtpConfig.port) === 465, // true para 465, false para otros
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    // Formatear montos
    const amountFormatted = parseFloat(receiptData.monto).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Construir HTML del recibo
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recibo de Abono de Cheque - Freund</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
          }
          .receipt-container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .receipt-header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px dashed #e2e8f0;
            background-color: #ffffff;
          }
          .logo {
            max-height: 48px;
            margin-bottom: 12px;
            display: inline-block;
          }
          .receipt-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #2563eb;
            margin: 0;
          }
          .receipt-body {
            padding: 24px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748b;
            margin: 0 0 12px 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
          }
          .data-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 13px;
          }
          .data-label {
            color: #64748b;
          }
          .data-value {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
          }
          .amount-section {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            margin-bottom: 20px;
          }
          .amount-num {
            font-size: 28px;
            font-weight: 800;
            color: #16a34a;
            margin: 0;
          }
          .amount-text {
            font-size: 11px;
            font-weight: 650;
            font-style: italic;
            color: #15803d;
            margin: 6px 0 0 0;
          }
          .micr-section {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            margin-top: 16px;
          }
          .micr-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #94a3b8;
            margin-bottom: 4px;
            display: block;
          }
          .micr-value {
            font-family: monospace;
            font-size: 11px;
            color: #0f172a;
            letter-spacing: 0.05em;
          }
          .badge-container {
            text-align: center;
            margin-top: 20px;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            background-color: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            border-radius: 9999px;
            padding: 6px 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .receipt-footer {
            background-color: #f8fafc;
            padding: 16px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <img src="cid:freundlogo" class="logo" alt="Freund" />
            <h1 class="receipt-title">Comprobante de Abono</h1>
          </div>
          
          <div class="receipt-body">
            
            <div class="amount-section">
              <p class="amount-num">$${amountFormatted}</p>
              <p class="amount-text">${receiptData.montoLetras}</p>
            </div>

            <div class="section-title">Cuenta de Origen</div>
            <div class="data-row">
              <span class="data-label">Cliente</span>
              <span class="data-value">${receiptData.cliente?.name || 'Cliente Desconocido'}</span>
            </div>
            <div class="data-row">
              <span class="data-label">ID Cliente</span>
              <span class="data-value">#${receiptData.cliente?.id || 'N/A'}</span>
            </div>
            <div class="data-row">
              <span class="data-label">NRC</span>
              <span class="data-value">${receiptData.cliente?.nrc || 'N/A'}</span>
            </div>

            <div class="section-title">Detalles del Cheque</div>
            <div class="data-row">
              <span class="data-label">Emisor</span>
              <span class="data-value">${receiptData.emisor}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Beneficiario</span>
              <span class="data-value">${receiptData.beneficiario}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Banco Emisor</span>
              <span class="data-value">${receiptData.banco}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Cuenta de Cheque</span>
              <span class="data-value">${receiptData.cuenta}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Número Cheque</span>
              <span class="data-value">#${receiptData.numeroSerie}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Fecha Emisión</span>
              <span class="data-value">${receiptData.fecha}</span>
            </div>

            ${receiptData.lineaMICR ? `
              <div class="micr-section">
                <span class="micr-label">Banda Magnética MICR</span>
                <span class="micr-value">${receiptData.lineaMICR}</span>
              </div>
            ` : ''}

            <div class="badge-container">
              <div class="badge">Abono Validado</div>
            </div>
          </div>
          
          <div class="receipt-footer">
            Este es un documento oficial emitido por Freund Cheque.
          </div>
        </div>
      </body>
      </html>
    `;

    // Localizar el logo en la carpeta public para adjuntarlo como CID
    const logoPath = path.join(process.cwd(), 'public', 'logoFreund2.png');
    const attachments = [];
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'logoFreund2.png',
        path: logoPath,
        cid: 'freundlogo', // Identificador en el img src del HTML
      });
    }

    // Enviar el correo
    await transporter.sendMail({
      from: smtpConfig.from || `"Freund Cheque Recibos" <${smtpConfig.user}>`,
      to: recipients,
      subject: `Recibo de Abono de Cheque - Freund ($${amountFormatted})`,
      html: htmlContent,
      attachments: attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending receipt email:', error);
    return NextResponse.json({
      error: 'Error al enviar el correo a través del servidor SMTP.',
      details: error.message || error,
    }, { status: 500 });
  }
}
