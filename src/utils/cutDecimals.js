export default function cutDecimals(number, pointsAfterDot) {
  // input 4120.51992437283 (string or number)
  if (!number) return 0; // in case of bad data
  const numberString = number.toString();
  const decimalIndex = numberString.indexOf('.');
  if (decimalIndex !== -1) {
    const cut = parseFloat(
      numberString.slice(0, decimalIndex + (pointsAfterDot + 1)),
    );
    if (cut >= 0.0001) {
      return cut;
    } else {
      return '<0.0001';
    }
  } else {
    return parseFloat(numberString); // if there's no decimal point, return the original number as is
  }
  // output 4120.5123 (number)
  // no rounding
}
