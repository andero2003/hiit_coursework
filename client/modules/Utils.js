export function formatDuration(dur) {
    const durationAsDate = new Date(dur * 1000)
    const minutes = String(durationAsDate.getMinutes()).padStart(2, '0');
    const seconds = String(durationAsDate.getSeconds()).padStart(2, '0');
    return `${minutes}:${seconds}`;
}