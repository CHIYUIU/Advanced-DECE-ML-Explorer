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
    private sliderRef: Reac