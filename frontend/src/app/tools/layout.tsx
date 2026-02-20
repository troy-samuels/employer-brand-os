import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Free Employer Brand Tools",
    template: "%s | Rankwell",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
