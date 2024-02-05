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
  twisty? :(idx: number) => number;
}

export const defaultOptions: IBarChartOptions = {
  width: 300,
  height: 200,
  margin: 3,
  innerPadding: 0.25,
  // maxStep: 35,
  color: defaultCategoricalColor,
  direction: 'up'
};

export function drawBarChart(params: {
  svg: SVGElement,
  // data: Category[],
  data: string[] | string[][],
  allData?: string[] | string[][],
  dmcData?: string[] | string[][],
  options?: Partial<IBarChartOptions>}
) {
  const {svg, data, allData, dmcData, options} = params;
  const opts = { ...defaultOptions, ...options };
  const {
    height,
    width,
    rectStyle,
    selectedCategories,
    onSelectCategories,
    color,
    xScale,
    direction,
    renderShades,
    drawAxis,
    twisty
  } = opts;

  const margin = getMargin(opts.margin);
  const root = d3.select(svg);

  // const y = d3
  //   .scaleLinear()
  //   .range(yRange)
  //   .domain([0, d3.max(allData || data, d => d.count) as number]);

  const layout = new BarChartLayout({
    data: data,
    dmcData: allData,
    width: width,
    height: height,
    mode: "side-by-side",
    margin: margin,
    xScale: xScale,
    direction
  })

  const bins = layout.layout;

  const AllDatalayout = allData && new BarChartLayout({
    data: allData,
    dmcData: allData,
    width: width,
    height: height,
    mode: "side-by-side",
    margin: margin,
    xScale: xScale,
    direction
  })

  const allBins = AllDatalayout && AllDatalayout.layout;

  const yRange = layout.yRange;

  let _selectedCategories: string[] | undefined = 