/**
 * Certificate data shapes (e.g. for PDF generation).
 */

export type CertificateData = {
  partnerId: string;
  partnerName: string;
  entityName: string;
  entityType: string;
  region: string;
  city: string;
  partnerSince: string;
  categories: string;
};

export type ProductCertificateData = {
  productName: string;
  category: string;
  organizationName: string;
  certifiedAt: string;
};
