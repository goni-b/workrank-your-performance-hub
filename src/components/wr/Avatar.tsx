import { avatarColorFor, initials } from "@/lib/wr-utils";

export function WrAvatar({ name, size = 36, src }: { name: string; size?: number; src?: string | null }) {
  const color = avatarColorFor(name || "?");
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "33",
        border: `1px solid ${color}66`,
        color,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: Math.max(11, Math.floor(size * 0.4)),
      }}
    >
      {initials(name || "?")}
    </div>
  );
}
