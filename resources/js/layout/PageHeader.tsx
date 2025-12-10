import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

// Composant Breadcrumb séparé
interface BreadcrumbProps {
  className?: string;
  items?: Array<{
    label: string;
    href: string;
  }>;
}

export function Breadcrumb({ className, items }: BreadcrumbProps) {
  const defaultItems = items || [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <Link 
        href="/dashboard" 
        className="hover:text-primary transition-colors flex items-center"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {defaultItems.map((item, index) => {
        const isLast = index === defaultItems.length - 1;
        
        return (
          <React.Fragment key={item.href}>
            <ChevronRight className="h-4 w-4 mx-2" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// Composant principal PageHeader
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: Array<{
    label: string;
    href: string;
  }>;
  showBreadcrumb?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  showBreadcrumb = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      {showBreadcrumb && <Breadcrumb items={breadcrumb} className="mb-4" />}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Variantes du PageHeader
export function PageHeaderSimple({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}

export function PageHeaderWithTabs({
  title,
  description,
  tabs,
  activeTab,
}: {
  title: string;
  description?: string;
  tabs: Array<{
    label: string;
    href: string;
    count?: number;
  }>;
  activeTab: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors",
                activeTab === tab.href
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs",
                  activeTab === tab.href
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}