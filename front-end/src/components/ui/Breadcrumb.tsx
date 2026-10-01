import React from "react";
import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {isLast || !item.href ? (
                  <span className="ml-1 text-sm font-medium text-gray-400 md:ml-2 dark:text-gray-500 cursor-default">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="ml-1 text-sm font-medium text-gray-600 hover:text-brand-500 md:ml-2 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
