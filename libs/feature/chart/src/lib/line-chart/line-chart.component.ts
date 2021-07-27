import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';

import { IChartLineItem } from '../models';
import { LineChartViewModel } from '../services/line-chart.view-model';


@Component({
	selector: 'bp-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.scss'],
	providers: [LineChartViewModel],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent {
	@ViewChild('chart')
	canvas: ElementRef<HTMLCanvasElement>;

	@Input()
	set data(lineItems: { [key: string]: IChartLineItem } | null) {
		if (lineItems) {
			this.vm.lines.next(lineItems);
		}
	}

	constructor(private vm: LineChartViewModel) {

	}

	ngAfterViewInit() {
		this.vm.initChart({
			canvas: this.canvas
		});
	}

	ngOnDestroy() {
		this.vm.destroy();
	}
}
