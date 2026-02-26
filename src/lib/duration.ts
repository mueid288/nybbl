export function parseDuration(durationStr: string): number {
    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m?)?/;
    const match = durationStr.toLowerCase().match(timeRegex);

    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const mins = parseInt(match[2] || '0', 10);

    return (hours * 60) + mins;
}

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
}
