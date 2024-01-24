
import * as d3 from 'd3';
import * as React from 'react';
import * as _ from "lodash";

import { IMargin, defaultCategoricalColor, getChildOrAppend, getScaleBand } from '../visualization/common';
import { getRowLabels, FeatureColumnProps, SankeyBins } from './common';
import { gini } from 'common/science';
import { Icon } from 'antd';
import { drawLink } from '../visualization/link'
import { CatTableColumn } from 'components/Table';
import { drawBarChart } from 'components/visualization/Barchart';

export interface CatFeatColProps extends FeatureColumnProps {
    column: CatTableColumn;
    CFColumn: CatTableColumn;
    protoColumn?: CatTableColumn;

    histogramType: 'side-by-side' | 'stacked';
    drawAxis?: boolean;
}

export interface CatHeaderFeatColProps extends CatFeatColProps {
    allColumn: CatTableColumn;
    allCFColumn: CatTableColumn;
    allLabelColumn: Readonly<CatTableColumn>;

    onUpdateFilter?: (categories?: string[]) => void;
    onUpdateCFFilter?: (categories?: string[]) => void;
}

export interface CatSubsetFeatColProps extends CatFeatColProps {
    selectedCategories: Readonly<string[]>;
    onUpdateSelectedCategories?: (categories?: string[]) => void;

    selected: boolean;
    onSelect?: () => void;
}

export interface CatFeatColState { }

export interface CatHeaderFeatColState extends CatFeatColState { }

export interface CatSubsetFeatColState extends CatFeatColState {
    selectedCategories?: string[];
    drawSankey: boolean;
    drawTooltip: boolean;
}

export class CatFeatCol<P extends CatFeatColProps, V extends CatFeatColState> extends React.PureComponent<P, V> {
    protected originData?: string[][];
    protected cfData?: string[][];
    protected svgRef: React.RefObject<SVGSVGElement> = React.createRef();
    protected shouldPaint: boolean;
