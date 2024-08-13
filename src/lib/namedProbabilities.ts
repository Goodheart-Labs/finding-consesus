const namedProbabilities = {
  3: "Very unlikely",
  8: "Little chance",
  20: "Unlikely",
  23: "Probably not",
  40: "Maybe",
  50: "About even",
  57: "Better than even",
  68: "Probably",
  74: "Likely",
  80: "Very good chance",
  90: "Highly likely",
  97: "Almost certain",
};

const namedProbabilityKeys = Object.keys(namedProbabilities).map(Number) as number[];

export function findNearestProbability(n: number) {
  const key = namedProbabilityKeys.reduce((prev, curr) => (Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev));
  return namedProbabilities[key as keyof typeof namedProbabilities];
}
