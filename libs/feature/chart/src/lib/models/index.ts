import type { ElementRef } from '@angular/core';

export type ILineColor = [number, number, number, number];
export type IPoint = { x: number; y: number };

export interface ILineChartSetup {
	canvas: ElementRef<HTMLCanvasElement>
}

export interface IChartLineItem {
	data: IPoint[];
	color?: ILineColor;
	hidden?: boolean;
}
