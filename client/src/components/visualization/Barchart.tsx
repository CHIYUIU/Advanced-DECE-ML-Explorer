import * as d3 from "d3";
// import {scaleOrdinal, scaleLinear} from 'd3-scale';
import * as React from "react";
import {
  getMargin,
  CSSPropertiesFn,
  ChartOptions,
  getChildOrAppend,
  IMargin,
  getScaleBand
} from "./common";
import memoizeOne from "memoize-one";
import { countCategories, defaultCategoricalColor } from './common';
import "./Barchart.scss";
import { isArrays } from "components/CompactTable/common";
import _ from "lodash";
import { transMax } from "common/math";

type Category = {
  count: number;
  name: string;
};

export interface IBarChartOptions extends ChartOptions {
  innerPadding: number;
  barWidth?: number;
  rectStyle?: CSSPropertiesFn<SVGRectElement, Category>;
  selectedCategories?: string[];
  onSelectCategories?: (cat?: string[]) => any;
  xScale?: d3.ScaleBand<string>,
  color: (x: number) => string,
  direction: 'up' | 'down',
  renderShades?: boolean,
  drawAxis?: boolean,
  twisty? :(idx: number) =>