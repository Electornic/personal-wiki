export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-light mx-auto min-h-[calc(100dvh-64px)] max-w-[1096px] rounded-none bg-[var(--content-bg)] md:my-4 md:rounded-[12px] md:border md:border-[var(--content-border)]">
      {children}
    </div>
  );
}
