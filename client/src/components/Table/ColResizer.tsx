import * as React from 'react';

export interface IColResizerProps {
  className?: string;
  x: number;
  onChangeX: (x: number) => void;
  style?: React.CSSProperties;
  snap: number;
}

export interface IColResizerState {}

export default class ColResizer extends React.Compo