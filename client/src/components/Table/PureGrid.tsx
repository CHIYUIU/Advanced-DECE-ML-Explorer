import * as React from "react";
import { Grid, GridCellProps, ScrollParams, GridCellRenderer, GridProps } from "react-virtualized";

export interface IPureGridProps extends GridProps {
    cellRenderer: GridCellRenderer;
    rowCount: number;
    rowHeight: number | ((p: { index: number }) => number);
    containerStyle?: React.CSSProperties;
}

export default class PureGrid extends React.PureComponent<IPureGridProps> {
    static defaultProps = {
        height: 20,
        chartHeight: 60,
        fixedColumns: 0,
        rowCount: 1,
    };

    protected GridRef: React.RefObject<Grid> = React.createRef();
    protected columnWidth: any;

    constructor(props: IPureGridProps) {
        super(props);
        this.defaultCellRenderer = this.defaultCellRenderer.bind(this);
        this.renderCell = this.renderCell.bind(this);
    }

    componentDidUpdate(prevProps: IPureGridProps) {
        console.debug("recompute grid size");
        if (this.GridRef.current)
            this.GridRef.current.recomputeGridSize();
    }

    public recomputeGridSize(params?: { columnIndex?: number, rowIndex?: number }){
        if (this.GridRef.current)
            this.GridRef.current.recomputeGridSize(params);
    }

    public render() {
        const {
            height,
            width,
            style,
            containerStyle,
            className,
            ...rest
        } = this.props;

        return (
            <div
                classN