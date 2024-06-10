export default function cutDecimals(number, pointsAfterDot) {
  // input 4120.51992437283 (string or number)
  if (!number) return 0; // in case of bad data
  if (number <= 0.0001) return '<0.0001';
  const numberString = number.toString();
  const decimalIndex = numberString.indexOf('.');
  if (decimalIndex !== -1) {
    const cut = parseFloat(
      numberString.slice(0, decimalIndex + (pointsAfterDot + 1)),
    );
    return cut;
  } else {
    return parseFloat(numberString); // if there's no decimal point, return the original number as is
  }
  // output 4120.5123 (number)
  // no rounding
}
