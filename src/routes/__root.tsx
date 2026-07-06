import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lim Sovannrady — Developer Portfolio" },
      { name: "description", content: "អ្នកអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់ — បង្កើតបទពិសោធន៍ឌីជីថលដ៏អស្ចារ្យ ដោយកូដស្អាត និងបច្ចេកវិទ្យាទំនើប។" },
      { name: "author", content: "Lim Sovannrady" },
      { property: "og:site_name", content: "Lim Sovannrady" },
      { property: "og:title", content: "Lim Sovannrady — Developer Portfolio" },
      { property: "og:description", content: "អ្នកអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់ ដែលបង្កើតបទពិសោធន៍ឌីជីថលដ៏អស្ចារ្យ។" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lim Sovannrady — Developer Portfolio" },
      { name: "twitter:description", content: "អ្នកអភិវឌ្ឍន៍កម្មវិធីកម្រិតខ្ពស់ — កូដស្អាត បច្ចេកវិទ្យាទំនើប។" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@200;300;400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        children: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;if(d){r.classList.add('dark');}else{r.classList.remove('dark');}}catch(e){}})();`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:pt-10">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

function Navbar() {
  const links = [
    { to: "/", label: "ទំព័រដើម" },
    { to: "/qr", label: "QR" },
    { to: "/remove-bg", label: "Remove BG" },
    { to: "/fonts", label: "Fonts" },
    { to: "/tools", label: "Tools" },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">◈</span>
          <span className="font-display text-base font-semibold tracking-tight">Multi-Tools</span>
          <span className="flame-wrap ml-1" aria-hidden="true"><span className="flame text-sm">🔥</span></span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
