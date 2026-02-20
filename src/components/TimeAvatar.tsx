import { Shield } from "lucide-react";

interface TimeAvatarProps {
  nome: string;
  escudoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export default function TimeAvatar({ nome, escudoUrl, size = "md" }: TimeAvatarProps) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" };
  const cls = sizes[size];

  if (escudoUrl) {
    return (
      <img
        src={escudoUrl}
        alt={nome}
        className={`${cls} rounded-full object-cover border border-border`}
      />
    );
  }

  return (
    <div className={`${cls} rounded-full bg-muted flex items-center justify-center`}>
      <Shield className="w-1/2 h-1/2 text-primary" />
    </div>
  );
}
