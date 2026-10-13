import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="logo">CASE FILE</Link>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
