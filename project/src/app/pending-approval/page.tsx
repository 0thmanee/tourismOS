import Link from "next/link";
import { getSession } from "~/app/api/auth/actions";
import { redirect } from "next/navigation";
import { PendingApprovalContent } from "./PendingApprovalContent";

const bg =
  "linear-gradient(in oklab 160deg, oklab(14% -0.025 0.012) 0%, oklab(22% -0.038 0.018) 100%)";

export default async function PendingApprovalPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=" + encodeURIComponent("/pending-approval"));
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ background: bg }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden
      >
        <defs>
          <pattern
            id="pending-pattern"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="10"
              y="10"
              width="28"
              height="28"
              fill="none"
              stroke="rgba(201,145,61,1)"
              strokeWidth="0.7"
            />
            <rect
              x="10"
              y="10"
              width="28"
              height="28"
              fill="none"
              stroke="rgba(201,145,61,1)"
              strokeWidth="0.7"
              transform="rotate(45 24 24)"
            />
            <circle cx="24" cy="24" r="3" fill="rgba(201,145,61,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pending-pattern)" />
      </svg>

      <PendingApprovalContent />
    </div>
  );
}
