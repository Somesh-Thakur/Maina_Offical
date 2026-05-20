// Auth group layout — intentionally bare (no sidebar / player / nav)
// This ensures /login renders as a standalone fullscreen page.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
