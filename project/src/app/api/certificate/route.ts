import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "~/app/api/auth/actions";
import { getProfileByUserId } from "~/app/api/profile/repo/profile.repo";
import type { CertificateData } from "./schemas/certificate.schema";
import { PartnerCertificateDocument } from "./PartnerCertificateDocument";

function formatPartnerId(userId: string): string {
  return "OM-" + userId.slice(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, "X");
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found. Complete onboarding first." },
      { status: 404 }
    );
  }

  const partnerId = formatPartnerId(session.user.id);
  const partnerName = `${profile.firstName} ${profile.lastName}`.trim() || (session.user.name ?? "");
  const categories = Array.isArray(profile.categories)
    ? (profile.categories as string[]).join(", ")
    : "";

  const data: CertificateData = {
    partnerId,
    partnerName,
    entityName: profile.entityName,
    entityType: profile.entityType,
    region: profile.region,
    city: profile.city,
    partnerSince: formatDate(profile.createdAt),
    categories,
  };

  const doc = React.createElement(PartnerCertificateDocument, { data });
  const pdfBuffer = await renderToBuffer(
    doc as React.ReactElement<import("@react-pdf/renderer").DocumentProps>
  );

  const body = new Uint8Array(pdfBuffer);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tourismos-partner-certificate.pdf"`,
      "Content-Length": String(body.length),
    },
  });
}
