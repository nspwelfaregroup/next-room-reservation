export default function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="card p-6 text-center text-gray-500 text-sm">{children}</div>;
}
