export function getInitials(name?: string) {
  if (!name) return "";
  const trimmedName = name.trim();
  const parts = trimmedName.split(" ");

  if (parts.length > 1 && parts[parts.length - 1]) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return trimmedName.substring(0, 2).toUpperCase();
}
