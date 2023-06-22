import type { CartItem } from "~/context/CartContext";

export function round(number: number, precision: number) {
  const d = Math.pow(10, precision);
  return Math.round((number + Number.EPSILON) * d) / d;
}

export function titleCase(string: string) {
  string = string.toLowerCase();
  const wordsArray = string.split(" ");

  for (var i = 0; i < wordsArray.length; i++) {
    wordsArray[i] =
      wordsArray[i].charAt(0).toUpperCase() + wordsArray[i].slice(1);
  }

  return wordsArray.join(" ");
}

export function formatList(list: Array<string>) {
  return list.join(", ");
}
