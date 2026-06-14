import { Badge, type Tone } from "./Badge";
import type { SkillStatus } from "@/lib/personalization";

const map: Record<SkillStatus, { tone: Tone; label: string }> = {
  untested: { tone: "neutral", label: "Untested" },
  weak: { tone: "danger", label: "Weak" },
  developing: { tone: "warning", label: "Developing" },
  strong: { tone: "brand", label: "Strong" },
};

export function statusTone(status: SkillStatus): Tone {
  return map[status].tone;
}

export function SkillStatusBadge({ status }: { status: SkillStatus }) {
  const { tone, label } = map[status];
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}
