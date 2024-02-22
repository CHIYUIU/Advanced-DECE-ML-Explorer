// TODO: remove this component and use barchart.tsx instead.

import * as d3 from "d3";
import * as _ from "lodash";
import {
    getMargin,
    CSSPropertiesFn,
    ChartOptions,
    getChildOrAppend,
    countCategories,
    getScaleBand
} from "../common";
import './naiveBarchart.scss'

export interface BarOption extends ChartOptions {
    selectedBars?: string[];
    xScale?: d3.ScaleBand<string>;
    innerPadding?: number;
    selected?: boolean[];
    onClick?: (id: number) => void;
}

export function drawSimpleBarchart(
    rootEle: SVGElement | SVGGElement,
    sliderOption: BarOption,
    data: ArrayLike<string>) {
    const options = { ...sliderOption };
    const { width, height, xScale, innerPadding, selected, onClick } = options;
    const margin = getMargin(options.margin);

    const xRange = [0, width - margin.right - margin.left] as [number, number];
    const yRange = [0, height - margin.top - margin.bottom] as [number, number];
    const x = xScale ? xScale : getScaleBand(xRange[0], xRange[1], data);
    const categoryData = countCategories(data, x.domain())
    const y = d3.scaleLinear()
        .range(yRange)
        .domain([0, d3.max(categoryData.map(d => d.count)) as number])

    const root = d3.select(rootEle);

    const barBase = getChildOrAppend<SVGGElement, SVGElement>(root, "g", "barchart-base")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    barB