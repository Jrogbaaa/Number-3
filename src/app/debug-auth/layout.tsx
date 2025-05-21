import DebugSessionProvider from "./DebugSessionProvider";

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DebugSessionProvider>
      {children}
    </DebugSessionProvider>
  );
} 