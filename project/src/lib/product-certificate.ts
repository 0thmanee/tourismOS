/**
 * Server-only: render product certificate PDF to buffer.
 * Used when admin approves a product to generate and store the certification document.
 */
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ProductCertificateData } from "~/app/api/certificate/schemas/certificate.schema";
import { ProductCertificateDocument } from "~/app/api/certificate/ProductCertificateDocument";

export async function renderProductCertificateToBuffer(
  data: ProductCertificateData
): Promise<Buffer> {
  const doc = React.createElement(ProductCertificateDocument, { data });
  const pdfBuffer = await renderToBuffer(
    doc as React.ReactElement<import("@react-pdf/renderer").DocumentProps>
  );
  return Buffer.from(pdfBuffer);
}
