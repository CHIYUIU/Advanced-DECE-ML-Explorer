import * as _ from "lodash";
import * as React from "react";
import * as d3 from "d3";

import {drawSimpleBarchart} from './naiveBarchart'
import { ICatColumn } from "data";
import { ChartOptions, getMargin, getChildOrAppend, getScaleBand } from "../common";
import { d3CheckBox } from "./checkBox";

import './slider.scss'
import './BarSlider.scss'


export interface BarSliderProps extends BandSliderOptions{
    column: ICatColumn
    style?: React.CSSProperties;
    svgStyle?: React.CSSProperties;
    className?: string;
    defaultInstanceValue?: string,
    defaultBarActivation?: boolean[]
    cfValue?: string;
    xScale: d3.ScaleBand<string>;
    editable: boolean;
    drawInput: boolean;
    onValueChange: (newValue: string) => void;
    onUpdateCats: (newCats: string[]) => void;
}

export interface BarSliderState {
    instanceValue: string,
    barActivation: boolean[],
}

export class BarSlider extends React.Component<BarSliderProps, BarSliderState>{
    private barRef: React.RefObject<SVGGElement> = React.createRef();
    private sliderRef: React.RefObject<SVGGElement> = React.createRef();
    constructor(props: BarSliderProps) {
        super(props);
        const {defaultValue, defaultBarActivation, column, xScale} = this.props;
        this.state = {
            instanceValue: defaultValue?defaultValue: xScale.domain()[0],
            barActivation: defaultBarActivation?defaultBarActivation: xScale.domain().map(d => true)
        }

        this.onBarClicked = this.onBarClicked.bind(this);
        this.onBarSelected = this.onBarSelected.bind(this);
        this.onValueChange =  this.onValueChange.bind(this);
        this.drawAll = this.drawAll.bind(this);
    }

    render(){
        const {className, height, width, svgStyle, style} = this.props;

        return <div className={(className || "") + " histslides"} style={{ ...style, width: width + 250 }}>
        <div style={{ width: width, float: "left" }}>
            <svg
                style={svgStyle}
                width={width}
                height={height}
                className='hist-slider'
            >
                <g ref={this.barRef} />
                <g ref={this.sliderRef} />
            </svg>
        </div>
    </div>
    }

    componentDidMount(){
        this.drawAll();
    }
    componentDidUpdate(prevProps: BarSliderProps){
        const {column, defaultValue, xScale, defaultBarActivation} = this.props;
        if (column.name !== prevProps.column.name) {
            this.setState({
                instanceValue: defaultValue?defaultValue: xScale.domain()[0],
                barActivation: defaultBarActivation?defaultBarActivation: xScale.domain().map(d => true)
            });
        }
        this.drawAll();
    }

    drawAll(){
        const {width, height, margin, column, xScale} = this.props;
        const {instanceValue, barActivation} = this.state;
        const sliderNode = this.sliderRef.current;
        const barChartNode = this.barRef.current;
        const onValueChange = this.onValueChange;
        if (barChartNode) {
            drawSimpleBarchart(barChartNode, {width, height, margin, xScale, selected: barActivation, onClick: this.onBarClicked}, column.series.toArray())
        }
        if (sliderNode){
            drawBandSlider(sliderNode, {width, height, margin, xScale, defaultValue: instanceValue, barActivation, onValueChange, onSelectBand: this.onBarSelected}, column.series.toArray());
        }
        

    }

    onBarClicked(index: number) {
        this.onValueChange(this.props.column.categories[index]);
    }

    onBarSelected(index: number){
        const {onUpdateCats, column} = this.props;
        const {barActivation} = this.state;
        barActivation[index] = !barActivation[index];
        this.setState({barActivation});
        onUpdateCats && onUpdateCats(column.categories.filter((d, i) => barActivation[i]));
    }

    onValueChange(newValue: string){
        const {onValueChange} = this.props;
        this.setState({instanceValue: newValue});
        onValueChange && onValueChange(newValue);
    }
}

export interface BandSliderOptions extends ChartOptions {
    defaultValue?: string;
    onValueChange?: (newValue: string) => void;
    onSelectBand?: (band: number) => void;
    xScale?: d3.ScaleBand<string>
    barActivation: boolean[]
}

export function drawBandSlider(
    rootEle: SVGElement | SVGGElement,
    options: BandSliderOptions,
    data: ArrayLike<string>,
) {
    const { height, width, onSelectBand, onValueChange, defaultValue, barActivation } = options;
    const margin = getMargin(options.margin);
    const _width = width - margin.left - margin.right;
    const _height = height - margin.top - margin.bottom;
    const xRange = [0, width - margin.right - margin.left] as [number, number];
    const x = options.xScale ? options.xScale : getScaleBand(0, _width, data)

    const root = d3.select(rootEle);
    const base = getChildOrAppend<SVGGElement, SVGElement | SVGGElement>(root, "g", "slider-base")
        .attr("transform", `translate(${margin.left}, ${margin.top + _height + 2})`);

    getChildOrAppend(base, "line", "track")
        .attr("x1", -2)
        .attr("x2", _width + 2);

    getChildOrAppend(base, "line", "track-inside")
        .attr("x1", -2)
        .attr("x2", _width + 2);

    // const xticks = x.ticks(ticks);
    const tickBase = getChildOrAppend(base, "g", "tick-base");

    const tick = tickBase.selectAll<SVGGElement, any>("g.tick")
        .data(x.domain())
        .join(
            enter => {
                return enter.append