import { IPoint, ILineColor } from '../models';

export class WebGlLine {
	id: string;
	data: IPoint[] = [];
	maxY = Number.MIN_VALUE;
	minY = Number.MAX_VALUE;
	maxX = Number.MIN_VALUE;
	minX = Number.MAX_VALUE;
	coords: Float32Array;
	vertexBuffer: WebGLBuffer | null = null;
	coordsAttrLocation = 0;
	hidden = false;

	get drawDataAmount(): number {
		return this.data.length;
	}

	constructor(public color: ILineColor, public pointsAmount: number = 0) {
		this.coords = new Float32Array(this.pointsAmount * 2);
	}

	setData(rawData: IPoint[]) {
		this.data = rawData;
		this.coords.set(this.normalizeData(rawData));
	}

	addPoint(point: IPoint) {
		const index = this.drawDataAmount * 2 - 1;
		if (this.shouldNormalizeAll(point)) {
			this.coords.set(this.normalizeData([...this.data, point]))
		} else {
			const newDataPoint = this.normalizeData([point]);
			if (index < this.coords.length - 2) {
				this.coords.set(newDataPoint, index);
				this.data[this.drawDataAmount - 1] = point;
			} else {
				const shiftedData = this.coords.slice(1);
				this.coords.set([...shiftedData, ...newDataPoint]);
				this.data = [...this.data.slice(1), point];
			}
		}
	}

	normalizeData(data: IPoint[]): number[] {
		this.minMaxData(data);

		const padding = (this.minY / 100) * 5;

		const tempData: number[] = [];

		data.forEach((point, index) => {
			tempData.push(
				this.roundToBounds((point.x - this.minX) / (this.maxX - this.minX)),
				this.roundToBounds((point.y - this.minY - padding) / (this.maxY - this.minY - padding))
			)
		});

		return tempData;
	}

	private minMaxData(data: IPoint[]) {
		data.forEach((point) => {
			this.minX = this.minX > point.x ? point.x : this.minX;
			this.maxX = this.maxX < point.x ? point.x : this.maxX;
			this.minY = this.minY > point.y ? point.y : this.minY;
			this.maxY = this.maxY < point.y ? point.y : this.maxY;
		});
	}

	private roundToBounds(num: number) {
		return num > 1 ? 1 : num < -1 ? -1 : num;
	}

	private shouldNormalizeAll(point: any) {
		return this.maxY < point.y || this.minY > point.y || this.maxX < point.x || this.minX > point.x;
	}
}
