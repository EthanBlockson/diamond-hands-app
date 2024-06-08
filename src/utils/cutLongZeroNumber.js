export default function cutLongZeroNumber(number) {
  let numStr = number.toFixed(20);
  let parts = numStr.split('.');
  let intPart = parts[0];
  let decPart = parts[1];

  if (intPart === '0') {
    let match = decPart.match(/(0+)(\d{1,4})/);
    if (match) {
      return '0.' + '0'.repeat(match[1].length) + match[2].substring(0, 4);
    } else {
      return '0.' + decPart.substring(0, 4);
    }
  } else {
    return intPart + '.' + decPart.substring(0, 4);
  }
}

// Test outputs
// console.log(cutLongZeroNumber(3.666254371014e-14));
// console.log(cutLongZeroNumber(0.000000000011232523523));
// console.log(cutLongZeroNumber(0.00001123));
// console.log(cutLongZeroNumber(0.197184327472347));
// console.log(cutLongZeroNumber(42112.197184327472347));
// console.log(cutLongZeroNumber(42112.00000072347));
// console.log(cutLongZeroNumber(42112.325000000020000003500072347));
