export const convert2DArrayToLevels = (
  arr: string[][],
  numberOfLevels: number
): Record<string, string[][]> => {
  const result: Record<string, string[][]> = {};
  for (let i = 1; i <= numberOfLevels; i++) {
    result[`level_${i}`] = arr.filter((nestedArr) => nestedArr.length === i);
  }
  return result;
};
