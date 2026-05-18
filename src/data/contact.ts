import type { ContactDetail } from "@/types";

export const contactDetails: ContactDetail[] = [
  { id: "email", label: "Email", value: "ceo@catalystdigitals.com" },
  { id: "phone", label: "Phone", value: "+94 72 280 0104" },
  { id: "location", label: "Headquarters", value: "Colombo, Sri Lanka" },
];

export const officeInfo = {
  title: "Find us",
  addressLine1: "Colombo",
  addressLine2: "Sri Lanka",
} as const;

export const trustBadge = {
  title: "Trusted by 200+ companies",
  subtitle: "From high-growth startups to Fortune 500 enterprises.",
} as const;
