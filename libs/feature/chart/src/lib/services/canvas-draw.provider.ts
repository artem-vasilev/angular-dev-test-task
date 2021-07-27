import { AbstractDrawProvider } from './abstract-draw.provider';


/**
 * TODO: add CanvasDrawProvider to support 2d type draw
 */
export class CanvasDrawProvider extends AbstractDrawProvider<any> {
	protected defaultContextOptions: CanvasRenderingContext2DSettings;

	addLine(line: any): void {
	}


	destroy(): void {
	}

	updateData(lineIndex: number): void {
	}

	protected bindEvents(): void {
	}

	protected drawAxes(): void {
	}
}
