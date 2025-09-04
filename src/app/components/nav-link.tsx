import Link from "next/link";
import { Button } from "@/components/button";
import { usePathname } from "next/navigation";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Dashboard", href: "/#sobre" },
  { label: "Educacional", href: "/#conteudo" },
  { label: "Newsletter", href: "/#newsletter" },
  { label: "Notícias", href: "components/news" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex space-x-4">
      {links.map(({ label, href }) => {
        const isActive =
          (href === "/news" && pathname === "/news") ||
          (href.startsWith("/#") && pathname === "/");
        return (
          <Link key={href} href={href}>
            <Button variant="icon" aria-current={isActive ? "page" : undefined}>
              {label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
