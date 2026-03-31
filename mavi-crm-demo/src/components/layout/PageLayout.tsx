import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <main className="page-layout">
      <header className="page-header">
        <h2>{title}</h2>
      </header>
      <div className="page-content">{children}</div>
    </main>
  );
}
