import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface BreadcrumbItem {
  label: string;
 href?: string;
}

interface PageHeaderProps {
 title: string;
 description?: string;
  action?: ReactNode;
 breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
 title,
  description,
 action,
 breadcrumbs,
}: PageHeaderProps) {
  return (
  <div className="mb-4">
 {breadcrumbs && breadcrumbs.length > 0 && (
 <nav className="mb-2 flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
 {breadcrumbs.map((item, i) => (
 <span key={i} className="flex items-center gap-1">
 {i > 0 && <span>/</span>}
 {item.href ? (
 <a href={item.href} className="hover:text-foreground">
 {item.label}
 </a>
 ) : (
 <span className="text-foreground">{item.label}</span>
 )}
 </span>
 ))}
 </nav>
 )}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div>
 <h1 className="text-lg sm:text-2xl font-bold tracking-tight">{title}</h1>
 {description && (
 <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
 )}
 </div>
 {action && <div className="flex-shrink-0">{action}</div>}
 </div>
 <Separator className="mt-3 sm:mt-4" />
 </div>
 );
}
