/**
 * Producer portal: nav items and page metadata.
 */

export const PRODUCER_NAV_ITEMS = [
  { label: "Dashboard", href: "/producer", badge: null },
  { label: "Inbox", href: "/producer/inbox", badge: null },
  { label: "Calendar", href: "/producer/calendar", badge: null },
  { label: "Bookings", href: "/producer/bookings", badge: null },
  { label: "Team", href: "/producer/staff", badge: null },
  { label: "Customers", href: "/producer/customers", badge: null },
  { label: "Payments", href: "/producer/payments", badge: null },
  { label: "Settings", href: "/producer/settings", badge: null },
] as const;

export const PAGE_SUBTITLE: Record<string, string> = {
  "/producer": "Finally, something simple that understands your booking workflow.",
  "/producer/inbox": "Replace WhatsApp chaos with a structured inbox.",
  "/producer/calendar": "Clarity for scheduling and availability.",
  "/producer/bookings": "A structured list of all your bookings.",
  "/producer/staff": "Coordinate guides and drivers without spreadsheet chaos.",
  "/producer/customers": "Simple CRM for your recurring clients.",
  "/producer/payments": "Track deposits and payments with confidence.",
  "/producer/settings": "Business settings and preferences.",
};

export function getPageTitle(pathname: string, firstName?: string | null): string {
  switch (pathname) {
    case "/producer":
      return firstName ? `Good morning, ${firstName}` : "Good morning";
    case "/producer/inbox":
      return "Inbox";
    case "/producer/calendar":
      return "Calendar";
    case "/producer/bookings":
      return "Bookings";
    case "/producer/staff":
      return "Team";
    case "/producer/customers":
      return "Customers";
    case "/producer/payments":
      return "Payments";
    case "/producer/settings":
      return "Settings";
    default:
      return "Dashboard";
  }
}
