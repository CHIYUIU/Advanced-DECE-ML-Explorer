import * as d3 from "d3";
import * as _ from 'lodash';
import { CSSProperties } from "react";

function colors(specifier: string) {
  let n = specifier.length / 6 | 0, colors: string[] = new Array(n), i = 0;
  while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
  return colors;
}

export const schemeTableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");

export const defaultCategoricalColor = (i: number) => schemeTableau10[i % schemeTableau10.length];

export interface IMargin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type MarginType = number | Partial<IMargin>;

export const defaultMarginLeft = 10,
  defaultMarginRight = 10,
  defaultMarginTop = 2,
  defaultMarginBottom = 2;

export const defaultMargin = {
  top: defaultMarginTop,
  bottom: defaultMarginBottom,
  left: defaultMarginLeft,
  right: defaultMarginRight
};

export function getMargin(margin: MarginType): IMargin {
  if (typeof margin === "number") {
    return { top: margin, bottom: margin, left: margin, right: margin };
  } else {
    return {
      top: defaultMarginTop,
      bottom: defaultMarginBottom,
      left: defaultMarginLeft,
      right: defaultMarginRight,
      ...margin
    };
  }
}

export type PropertyValueFn<T, E extends d3.BaseType, Datum, Result> = {
  [P in keyof T]: Result | d3.ValueFn<E, Datum, Result>;
};

export type CS