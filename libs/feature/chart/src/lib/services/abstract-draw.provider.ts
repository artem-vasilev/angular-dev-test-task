import { ILineColor } from '../models';


export abstract class AbstractDrawProvider<T> {
	context: WebGL2RenderingContext | WebGLRenderingContext | CanvasRenderingContext2D;

	protected abstract defaultContextOptions: WebGLContextAttributes | CanvasRenderingContext2DSettings;


	constructor(
		protected canvas: HTMLCanvasElement,
		protected contextId: '2d' | 'webgl' | 'webgl2',
		protected options?: WebGLContextAttributes | CanvasRenderingContext2DSettings
	) {
		this.setContext(options);
		const devicePixelRatio = window.devicePixelRatio || 1;
		this.canvas.width = canvas.clientWidth * devicePixelRatio;
		this.canvas.height = canvas.clientHeight * devicePixelRatio;
	}

	setContext(options?: WebGLContextAttributes | CanvasRenderingContext2DSettings) {
		const contextOptions = options ?? this.defaultContextOptions;
		this.context = <WebGL2RenderingContext | WebGLRenderingContext | CanvasRenderingContext2D>this.canvas.getContext(this.contextId, contextOptions);

		if (!this.context) {
			if (['webgl', 'webgl2'].includes(this.contextId)) {
				this.context = <WebGL2RenderingContext | WebGLRenderingContext>this.canvas.getContext(
					`experimental-${ this.contextId }`,
					contextOptions,
				)!;
			} else {
				throw Error('Can`t create WebGL context!');
			}
		}
	}

	abstract addLine(lineId: string, color: ILineColor, extra: any): T;

	protected abstract drawAxes(): void;

	protected abstract bindEvents(): void;

	abstract destroy(): void;

	abstract drawLineData(line: T): void;

}
