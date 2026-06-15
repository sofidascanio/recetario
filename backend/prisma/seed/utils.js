export function addDays(days) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
}