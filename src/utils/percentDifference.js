export function percentDifference(startingNumber, endingNumber, currentNumber) {
  if (currentNumber > endingNumber) return 100;

  const totalAmount = endingNumber - startingNumber;
  const howFar = currentNumber - startingNumber;

  const difference = (howFar / totalAmount) * 100;

  // console.log([
  //   startingNumber,
  //   endingNumber,
  //   currentNumber,
  //   totalAmount,
  //   howFar,
  //   difference > 0 ? Math.floor(difference) : 0,
  // ]); // TEMP

  // threat negative numbers as 0, seeking only positive percent growth here
  return difference > 0 ? Math.floor(difference) : 0;
}
