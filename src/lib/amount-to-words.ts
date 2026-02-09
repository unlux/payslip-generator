import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

export function amountToWords(amount: number): string {
  if (amount === 0) return "Zero Only";
  const words = toWords.convert(Math.abs(amount));
  const prefix = amount < 0 ? "Minus " : "";
  return `${prefix}${words} Only`;
}
