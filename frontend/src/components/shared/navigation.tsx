import Link from "next/link";

const navItems = [
  { label: "Product", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Customers", href: "#testimonials" },
  { label: "Audit", href: "#audit" },
];

export function Navigation() {
  return (
    <nav className="hidden items-center gap-8 text-sm text-gray-600 md:flex">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="hover:text-gray-900 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
