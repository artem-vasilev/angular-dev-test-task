import { ILineColor, IPoint } from '../models';
import { AbstractDrawProvider } from './abstract-draw.provider';
import { WebGlLine } from './webgl-line';


export class WebglDrawProvider extends AbstractDrawProvider<WebGlLine> {
	context: WebGL2RenderingContext;

	lineProgram!: WebGLProgram;

	linesData = new Map<string, WebGlLine>();

	indicatorProgram!: WebGLProgram;

	defaultContextOptions: WebGLContextAttributes = {
		antialias: true,
	};

	constructor(public canvas: HTMLCanvasElement, options?: WebGLContextAttributes) {
		super(canvas, 'webgl2', options);
		this.clearViewport();
		this.context.viewport(-this.canvas.width / 2, 0, this.canvas.width, this.canvas.height);
		this.createRowProgram();
		this.drawAxes();
		this.bindEvents();
	}

	destroy() {
		this.context.deleteProgram(this.lineProgram);
		this.context.getExtension('WEBGL_lose_context')?.loseContext();
		this.linesData.clear();
	}

	drawAllLines() {
		this.linesData.forEach((line) => {
			this.drawLineData(line);
		});
	}

	updateByIndex(lineId: string, data: IPoint[]) {
		if (this.linesData.has(lineId)) {
			const line = this.linesData.get(lineId)!;
			line.setData(data);
			this.drawLineData(line);
		}
	}

	drawLinePoint(lineId: string, data: IPoint) {
		if (this.linesData.has(lineId)) {
			const line = this.linesData.get(lineId)!;
			line.addPoint(data);
			this.drawLineData(line);
		}
	}

	addLine(
		lineId: string,
		color: ILineColor,
		{ pointsAmount, initialData, hidden }: { pointsAmount: number; initialData: IPoint[]; hidden?: boolean },
	): WebGlLine {
		const line: WebGlLine = new WebGlLine(color, pointsAmount);
		line.hidden = !!hidden;
		line.setData(initialData);
		line.id = lineId;
		line.vertexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, line.vertexBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, line.coords, this.context.STREAM_DRAW);
		line.coordsAttrLocation = this.context.getAttribLocation(this.lineProgram, 'coords');
		this.context.vertexAttribPointer(line.coordsAttrLocation, 2, this.context.FLOAT, false, 0, 0);
		this.context.enableVertexAttribArray(line.coordsAttrLocation);
		this.linesData.set(lineId, line);

		return line;
	}

	drawLineData(line: WebGlLine): void {
		if (!line.hidden) {
			this.context.useProgram(this.lineProgram);
			const color = this.context.getUniformLocation(this.lineProgram, 'color');
			const lineColor = new Float32Array(line.color);
			this.context.uniform4fv(color, lineColor);
			this.context.bufferData(this.context.ARRAY_BUFFER, line.coords, this.context.STREAM_DRAW);
			this.context.drawArrays(this.context.LINE_STRIP, 0, line.drawDataAmount);
			this.context.drawArrays(this.context.POINTS, 0, line.coords.length / 2);
			this.drawAxes();
		}
	}

	private createRowProgram(): void {
		const vertexCode = `
		  attribute vec2 coords;
		  void main(void) {
			 vec2 line = vec2(coords.x, coords.y);
			 gl_Position = vec4(line, 0.0, 1.0);
			 gl_PointSize = 5.0;
		  }`;

		const colorCode = `
			 precision mediump float;
			 uniform highp vec4 color;
			 void main(void) {
				gl_FragColor =  color;
			 }`;

		const vertexShader = this.createShader(this.context.VERTEX_SHADER, vertexCode);
		const fragmentShader = this.createShader(this.context.FRAGMENT_SHADER, colorCode);

		if (!vertexShader || !fragmentShader) {
			return;
		}

		this.lineProgram = this.context.createProgram()!;

		this.context.attachShader(this.lineProgram, vertexShader);
		this.context.attachShader(this.lineProgram, fragmentShader);
		this.context.linkProgram(this.lineProgram);

		const programLinkStatus = this.context.getProgramParameter(this.lineProgram, this.context.LINK_STATUS);

		if (!programLinkStatus) {
			this.context.deleteProgram(this.lineProgram);
		}
	}

	protected createShader(shaderType: GLenum, code: string): WebGLShader | null {
		const shader = this.context.createShader(shaderType);

		if (!shader) {
			return null;
		}

		this.context.shaderSource(shader, code);
		this.context.compileShader(shader);
		const shaderStatus = <boolean>this.context.getShaderParameter(shader, this.context.COMPILE_STATUS);

		if (!shaderStatus) {
			this.context.deleteShader(shader);

			return null;
		}

		return shader;
	}

	protected clearViewport() {
		this.context.clearColor(255, 255, 255, 1);
		this.context.clear(this.context.COLOR_BUFFER_BIT);
	}

	protected drawAxes() {
		const vertices = [
			0, 0, 1, 0,
			0, 0, 0, 1,
		];
		let coords;
		const vertexBuffer = this.context.createBuffer();
		this.context.bindBuffer(this.context.ARRAY_BUFFER, vertexBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array(vertices), this.context.STREAM_DRAW);
		coords = this.context.getAttribLocation(this.lineProgram, 'coords');
		this.context.vertexAttribPointer(coords, 2, this.context.FLOAT, false, 0, 0);
		this.context.enableVertexAttribArray(coords);
		this.context.useProgram(this.lineProgram);
		const color = this.context.getUniformLocation(this.lineProgram, 'color');
		this.context.uniform4fv(color, [0, 0, 0, 1]);
		this.context.drawArrays(this.context.LINE_STRIP, 0, vertices.length / 2);
	}

	protected bindEvents() {
		this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
	}

	private onMouseMove(event: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		// @ts-ignore
		const pixelX = mouseX * this.context.canvas.width / this.context.canvas.clientWidth;
		// @ts-ignore
		const pixelY = this.context.canvas.height - mouseY * this.context.canvas.height / this.context.canvas.clientHeight - 1;

	}

	// @ts-ignore
	private initIndicator() {
		const indVertexCode = `
			uniform float offsetX;
			uniform mat4 mvp;
			attribute vec2 position;
			void main() {
			  gl_Position = mvp * vec4(position.x + offsetX, position.y, 0.1, 1.0);
			}
	    `;
		const indColorCode = `
			precision mediump float;
			void main() {
			  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
			}
    	`;

		const vertexShader = this.createShader(this.context.VERTEX_SHADER, indVertexCode);
		const fragmentShader = this.createShader(this.context.FRAGMENT_SHADER, indColorCode);

		if (!vertexShader || !fragmentShader) {
			return;
		}

		this.indicatorProgram = this.context.createProgram()!;

		this.context.attachShader(this.indicatorProgram, vertexShader);
		this.context.attachShader(this.indicatorProgram, fragmentShader);

	}
}
