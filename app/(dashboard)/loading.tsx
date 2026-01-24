import { LoadingOverlay } from "@/components/shared/LoadingSpinner";

export default function DashboardLoading() {
  return <LoadingOverlay message="Loading…" className="min-h-[40vh]" />;
}
