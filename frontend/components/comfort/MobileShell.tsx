export default function MobileShell({
  children,
  glow = true,
}: {
  children: React.ReactNode;
  glow?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#0A0F1C] px-4 py-6 text-white">
      {glow && (
        <>
          <div className="pointer-events-none fixed left-0 top-0 h-72 w-72 rounded-full bg-[#2B7FE0]/10 blur-3xl" />
          <div className="pointer-events-none fixed bottom-0 right-0 h-72 w-72 rounded-full bg-[#4FB8E8]/10 blur-3xl" />
        </>
      )}
      <div className="relative mx-auto min-h-[calc(100vh-3rem)] w-full max-w-md pb-24">
        {children}
      </div>
    </div>
  );
}
