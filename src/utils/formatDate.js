export function formatDate(date, isTimestamp) {
  let dateToFormat = date;
  if (isTimestamp) dateToFormat = new Date(date * 1000);
  return dateToFormat.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
