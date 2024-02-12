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
      rerenderShades();
    })
    .on("mousemove", function (data, idx, groups) {
      if (_hoveredCategory === layout.x.domain()[idx])
        _hoveredCategory = undefined;
      rerenderShades();
    })
    .on("click",function (data, idx) {
      const selectedCat = layout.x.domain()[idx];
      if (_selectedCategories) {
        const indexOfCat = _selectedCategories.indexOf(selectedCat);
        if (indexOfCat > -1) {
          _selectedCategories.splice(indexOfCat, 1);
          _hoveredCategory = undefined;
          rerenderShades();
          onSelectCategories && onSelectCategories(_selectedCategories);
        }
        else {
          _selectedCategories.push(selectedCat);
          rerenderShades();
          onSelectCategories && onSelectCategories(_selectedCategories);
        }
      }
      else {
        _selectedCategories = [selectedCat];
        rerenderShades();
        onSelectCategories && onSelectCategories(_selectedCategories);
      }
    })

  }

  if (rectStyle) {
    Object.keys(rectStyle).forEach(key => {
      merged.style(
        key,
        (rectStyle[key as keyof typeof rectStyle] || null) as null
      );
    });
  }
}

export interface IBarChartProps extends Omit<IBarChartOptions, "allData"> {
  data: string[] | string[][];
  barWidth?: number;
  categories?: string[];
  allData?: string[] | string[][];
  style?: React.CSSProperties;
  svgStyle?: React.CSSProperties;
  xScale: d3.ScaleBand<string>;
  className?: string;
}

export interface IBarChartState {
  hoveredCategory: string | null;
}

export class BarChart extends React.PureComponent<
  IBarChartProps,
  IBarChartState
  > {
  static defaultProps = { ...defaultOptions };
  private ref: React.RefObject<SVGSVGElement> = React.createRef();
  private shouldPaint: boolean = false;
  constructor(props: IBarChartProps) {
    super(props);

    this.state = { hoveredCategory: null };
    this.paint = this.paint.bind(this);
  }

  count = memoizeOne(countCategories);
  countAll = memoizeOne(countCategories);

  public paint(svg: SVGSVGElement | null = this.ref.current) {
    if (svg) {
      console.debug("rendering bar chart");
      const { data, style, svgStyle, className, height, xScale, allData, ...rest } = this.props;
      drawBarChart(
        {svg, data, allData, dmcData: data, options: {
        ...rest,
        xScale,
        height: height,
      }});
      this.shouldPaint = false;
    }
  }

  public componentDidMount() {
    this.paint();
  }

  public componentDidUpdate(
    prevProps: IBarChartProps,
    prevState: IBarChartState
  ) {
    this.shouldPaint = true;
    const delayedPaint = () => {
      if (this.shouldPaint) this.paint();
    };
    window.setTimeout(delayedPaint, 200);
    // }
  }

  public render() {
    const {
      style,
      svgStyle,
      className,
      width,
      height,
      data,
      categories
    } = this.props;
    const { hoveredCategory } = this.state;
    const barData = this.count(isArrays(data) ? data[0] : data, categories);
    return (
      <div className={(className || "") + " bar-chart"} style={style}>
        <svg
          ref={this.ref}
          style={svgStyle}
          width={width}
          height={height}
        />
      </div>
    );
  }
}

export default BarChart;

interface BarChartLayoutProps extends ChartOptions {
  data: string[] | string[][],
  mode: 'side-by-side' | 'stacked',
  dmcData?: string[] | string[][],
  innerPadding?: number,
  groupInnerPadding?: number,
  xScale?: d3.ScaleBand<string>,
  yScale?: d3.ScaleLinear<number, number>,
  direction?: 'up' | 'down',
}

interface BarLayout extends Category {
  x: number,
  y: number,
  width: number,
  height: number,
}

export class BarChartLayout {
  private _data: string[][];
  private _dmcData: string[][];
  private _mode: 'side-by-side' | 'stacked';
  private _width: number;
  private _height: number;
  private _margin: IMargin;
  private _innerPadding: number;
  private _groupInnerPadding: number;
  private _xScale: d3.ScaleBand<string>;
  private _yScale: d3.ScaleLinear<number, number>;
  private _direction: 'up' | 'down';

  constructor(props: BarChartLayoutProps) {
    const { data, dmcData, mode, width, height, innerPadding, groupInnerPadding, xScale, margin, yScale, direction } = props;
    this._data = isArrays(data) ? data : [data];
    this._dmcData = dmcData ? (isArrays(dmcData) ? dmcData : [dmcData]) : this._data;
    // this._mode = mode;
    this._mode = 'side-by-side';
    this._width = width;
    this._height = height;
    this._margin = getMargin(margin);
    this._innerPadding = innerPadding ? innerPadding : 1;
    this._groupInnerPadding = groupInnerPadding ? groupInnerPadding : (this._data.length === 1 ? 0 : 1);
    this._direction = direction ? direction : 'up';

    this._xScale = this.getXScale(xScale);
    this._yScale = this.getYScales(yScale);
  }

  private getXScale(xScale?: d3.ScaleBand<string>): d3.ScaleBand<string> {
    return xScale ? xScale : getScaleBand(this.xRange[0], this.xRange[1], _.flatten(this._dmcData));
  }

  private getYScales(yScale?: d3.ScaleLinear<number, number>):
    d3.ScaleLinear<number, number> {
    const dmcBins = this._dmcData.map(d => this.count(d, this.x.domain()));
    const yMax = this._mode === 'side-by-side' ? d3.max(dmcBins, function (bs) {
      return d3.max(bs, d => d.count);
    }) : d3.max(transMax(dmcBins), function (bs) {
      return d3.sum(bs, d => d.count);
    });
    if (yMax === undefined) throw "Invalid bins";
    const _yScale = yScale ? yScale : d3.scaleLinear().range(this.yRange).domain([0, yMax]);
    return _yScale;
  }

  public get xRange(): [number, number] {
    // return [this._margin.left, this._width - this._margin.right];
    return [0, this._width - this._margin.right - this._margin.left];
  }

  public get yRange(): [number, number] {
    return [0, this._height - this._margin.bottom - this._margin.top];
  }

  public get x(): d3.ScaleBand<string> {
    return t