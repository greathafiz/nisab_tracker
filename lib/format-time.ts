/**
 * Format a date string to relative time (e.g., "Today at 11:11 AM", "Yesterday", "2 days ago")
 * Falls back to absolute date for older dates
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Calculate difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time for "Today"
  const timeFormat = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Today
  if (diffDays === 0) {
    return `Today at ${timeFormat}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // 2-3 days ago
  if (diffDays >= 2 && diffDays <= 3) {
    return `${diffDays} days ago`;
  }

  // Older than 3 days - show absolute date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Format for the hero section "Updated" badge and for badges or places where we may want to show how recently something was updated.
 */
export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeFormat = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Today
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return "Just now";
      return `${diffMinutes} min ago`;
    }

    if (diffHours < 6) {
      return `${diffHours}h ago`;
    }

    return `Today, ${timeFormat}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return `Yesterday, ${timeFormat}`;
  }

  // 2-3 days ago
  if (diffDays >= 2 && diffDays <= 3) {
    return `${diffDays} days ago`;
  }

  // Older - show full date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
