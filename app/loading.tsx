import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" label="Loading…" />
    </div>
  );
}
