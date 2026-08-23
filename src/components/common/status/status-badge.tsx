import { Badge } from "@/components/ui/badge";
import { getStatusConfig } from "@/lib/status/config";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
