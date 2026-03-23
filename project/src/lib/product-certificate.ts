/**
 * Server-only: render product certificate PDF to buffer.
 * Used when admin approves a product to generate and store the certification document.
 */

import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ProductCertificateDocument } from "~/app/api/certificate/ProductCertificateDocument";
import type { ProductCertificateData } from "~/app/api/certificate/schemas/certificate.schema";

export async function renderProductCertificateToBuffer(
	data: ProductCertificateData,
): Promise<Buffer> {
	const doc = React.createElement(ProductCertificateDocument, { data });
	const pdfBuffer = await renderToBuffer(
		doc as React.ReactElement<import("@react-pdf/renderer").DocumentProps>,
	);
	return Buffer.from(pdfBuffer);
}
