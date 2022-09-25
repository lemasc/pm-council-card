const maxValue = 60;

const stepToPercent = (step: number) => {
  return step + 20;
};

const percentToStep = (percent: string) => {
  return parseFloat(percent.slice(0, -1)) - 20;
};

export { maxValue, stepToPercent, percentToStep };
