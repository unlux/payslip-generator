import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "submitted":
      return <Badge variant="default">Submitted</Badge>;
    case "signed":
      return (
        <Badge variant="outline" className="text-green-600">
          Signed
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
