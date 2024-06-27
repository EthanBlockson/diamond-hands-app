export default function cutLongZeroNumber(number) {
  // Check if the input is a number, if not return '?'
  if (isNaN(number)) return '?';

  // Convert the number to a string with 18 decimal places
  let numStr = number.toFixed(18);

  // Split the number into integer and decimal parts
  let parts = numStr.split('.');
  let intPart = parts[0];

  // Remove trailing zeroes from the decimal part
  let decPart = parts[1].replace(/0+$/, '');

  // If the integer part is '0', handle the decimal part specifically
  if (intPart === '0') {
    // Match leading zeroes followed by up to 4 digits in the decimal part
    let match = decPart.match(/(0+)(\d{1,4})/);

    // If a match is found, return the formatted string with leading zeroes
    if (match) {
      return '0.' + '0'.repeat(match[1].length) + match[2].substring(0, 4);
    } else {
      // Otherwise, return the first 4 digits of the decimal part
      return '0.' + decPart.substring(0, 4);
    }
  } else {
    // If the integer part is not '0', return the formatted string
    // Include the decimal part if it exists, up to 4 digits
    return intPart + (decPart ? '.' + decPart.substring(0, 4) : ''); // Remove unnecessary ".0000"
  }
}

// Test outputs
// console.log(cutLongZeroNumber(3.666254371014e-14));
// console.log(cutLongZeroNumber(0.000000000011232523523));
// console.log(cutLongZeroNumber(0.00001123));
// console.log(cutLongZeroNumber(0.197184327472347));
// console.log(cutLongZeroNumber(0.1));
// console.log(cutLongZeroNumber(42112.197184327472347));
// console.log(cutLongZeroNumber(42112.00000072347));
// console.log(cutLongZeroNumber(42112.325000000020000003500072347));
// console.log(cutLongZeroNumber(42112));
