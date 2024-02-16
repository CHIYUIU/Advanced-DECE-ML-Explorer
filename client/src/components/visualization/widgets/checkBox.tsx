import * as d3 from "d3";
import * as _ from "lodash";
// import {SwapRightOutlined} from '@ant-design/icons';
import {
    getMargin,
    CSSPropertiesFn,
    ChartOptions,
    getChildOrAppend,
    getScaleLinear,
    getScaleBand
} from "../common";
import './checkBox.scss'

export interface CheckBoxOptions extends ChartOptions {
    x: number,
    y: number,
    rx: number,
    ry: number,
    onClick: () => void,
    defaultValue: boolean,
}

const defaultCheckBoxOption: CheckBoxOptions = {
    height: 15,
    width: 15,
    margin: 0,
    x: 0,
    y: 0,
    rx: 1,
    ry: 1,
    defaultValue: true,
    onClick: 