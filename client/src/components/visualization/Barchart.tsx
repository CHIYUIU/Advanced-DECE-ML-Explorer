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

  let _selectedCategories: string[] | undefined = selectedCategories;

  let _hoveredCategory: string | undefined = undefined;

  // Render the base histogram (with all data)
  const base = getChildOrAppend<SVGGElement, SVGElement>(root, "g", "base")
    .attr(
      "transform",
      `translate(${margin.left + layout.x.paddingOuter()}, ${margin.top})`
    );

  const baseGs = base.selectAll<SVGGElement, BarLayout[]>("g.groups")
    .data(allBins || [])
    .join<SVGGElement>(enter => {
      return enter
        .append("g")
        .attr("class", "groups");
    })
    .attr("fill", (d, i) => color(i));

  const barGs = baseGs
    .selectAll<SVGRectElement, BarLayout>("rect.bar")
    .data(d => d)
    .join<SVGRectElement>(enter => {
      return enter
        .append("rect")
        .attr("class", "bar");
    })
    .attr("transform", (d, i) => `translate(${d.x}, ${d.y})`)
    .attr("width", d => d.width)
    .attr("height", d => d.height)

  // Render the current histogram (with filtered data)

  const current = getChildOrAppend<SVGGElement, SVGElement>(root, "g", "current")
    .attr(
      "transform",
      `translate(${margin.left + layout.x.paddingOuter()}, ${margin.top})`
    );

  const gs = current.selectAll<SVGGElement, BarLayout[]>("g.groups")
    .data(bins)
    .join<SVGGElement>(enter => {
      return enter
        .append("g")
        .attr("class", "groups");
    })
    .attr("fill", (d, i) => color(i));

  const merged = gs
    .selectAll("rect.bar")
    .data(d => d)
    .join<SVGRectElement>(enter => {
      return enter
        .append("rect")
        .attr("class", "bar");
    })
    .attr("transform", (d, i) => `translate(${d.x}, ${d.y})`)
    .attr("width", d => d.width)
    .attr("height", d => d.height);

  if (!isArrays(data)) {
    merged.attr("fill", (d, i) => color(i));
    barGs.attr("fill", (d, i) => color(i));
  }

  // Render the shades for highlighting selected regions
  if (renderShades){
  const gShades = getChildOrAppend<SVGGElement, SVGElement>(
    root,
    "g",
    "shades"
  )
    .attr(
      "transform",
      `translate(${margin.left + layout.x.paddingOuter()}, ${margin.top})`
    );

  const yreverse = d3.scaleLinear().domain(layout.y.domain()).range([layout.y.range()[1], layout.y.range()[0]])
    if (drawAxis) {
      base.call(d3.axisLeft(yreverse).ticks(2));
    }

  const shadeRects = gShades.selectAll("rect.shade")
    .data(layout.x.domain())
    .join<SVGRectElement>(enter => {
      return enter.append("rect")
        .attr("class", 'shade')
    })
    .attr("x", d => layout.x(d)!)
    .attr("width", layout.groupedBarWidth)
    .attr("height", yRange[1])
    .classed("show", (d, idx) =>
      _selectedCategories?.includes(d) || d === _hoveredCategory
    );

  if (twisty) {
    shadeRects.style("fill", (d, i) => d3.interpolateReds(twisty(i)?twisty(i):0));
  }

  const rerenderShades = () => {
    shadeRects.classed("show", (d, idx) =>
      _selectedCategories?.includes(d) || d === _hoveredCategory
    );
  }

  shadeRects
    .on("mouseover", function (data, idx, groups) {
      _hoveredCategory = layout.x.domain()[idx];