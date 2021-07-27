import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ILineChartSetup, ILineColor, IChartLineItem, IPoint } from '../models';
import { WebglDrawProvider } from './webgl-draw.provider';


@Injectable()
export class LineChartViewModel {
	lines = new BehaviorSubject<{ [key: string]: IChartLineItem }>({ });
	private drawProvider: WebglDrawProvider;
	private subscription: Subscription[] = [];

	initChart(setup: ILineChartSetup) {
		const canvasEl = setup.canvas.nativeElement;
		this.drawProvider = new WebglDrawProvider(canvasEl);

		Object.entries(this.lines.getValue()).forEach(([lineId, line]) => {
			this.addLine(lineId, line);
		});

		this.drawProvider.drawAllLines();

		this.subscription.push(this.lines.subscribe((lines) => {
			this.updateAllLines(lines);
		}));
	}

	addPoint(lineId: string, data: IPoint) {
		this.drawProvider.drawLinePoint(lineId, data);
	}

	addLine(lineId: string, line: IChartLineItem) {
		const numX = Math.round(this.drawProvider.canvas.width);
		this.drawProvider.addLine(lineId, line.color || this.generateRandomColor(), { pointsAmount: numX, initialData: line.data });
	}

	updateAllLines(lines: { [key: string]: IChartLineItem }) {
		Object.entries(lines).forEach(([lineId, line]) => {
			if (this.hasLine(lineId)) {
				this.updateLineData(lineId, line.data);
			} else {
				this.addLine(lineId, line);
			}
		});

		this.drawProvider.linesData.forEach((line,lineId) => {
			if (!lines[lineId]) {
				this.drawProvider.linesData.delete(lineId);
			}
		})

		this.drawProvider.drawAllLines();
	}

	updateLineData(lineId: string, data: IPoint[]) {
		if (this.hasLine(lineId)) {
			this.drawProvider.updateByIndex(lineId, data);
		}
	}

	hasLine(lineId: string) {
		return !!this.drawProvider?.linesData.has(lineId);
	}

	destroy() {
		this.subscription.forEach((s) => s.unsubscribe());
		this.drawProvider.destroy();
	}

	private generateRandomColor(): ILineColor {
		return [Math.random(), Math.random(), Math.random(), 1];
	}
}
