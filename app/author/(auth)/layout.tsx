export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-light mx-auto min-h-[calc(100dvh-64px)] max-w-[1096px] bg-[var(--content-bg)]">
      {children}
    </div>
  );
}
