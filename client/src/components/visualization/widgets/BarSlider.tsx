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
                instanceValue: defaultValue?defa