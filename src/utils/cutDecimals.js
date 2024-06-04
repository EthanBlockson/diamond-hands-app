export default function cutDecimals(number) {
  // input 4120.51992437283 (string or number)
  if (!number) return 0; // in case of bad data
  const numberString = number.toString();
  const decimalIndex = numberString.indexOf('.');
  if (decimalIndex !== -1) {
    return parseFloat(numberString.slice(0, decimalIndex + 5));
  } else {
    return parseFloat(numberString); // if there's no decimal point, return the original number as is
  }
  // output 4120.5123 (string)
  // no rounding
}
