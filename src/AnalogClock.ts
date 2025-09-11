export interface AnalogClockTheme {
face: string; // background color of the face
border: string; // border color
hourMark: string; // color of marks
hourHand: string;
minuteHand: string;
secondHand: string;
number: string;
}


export interface AnalogClockOptions {
size?: number; // diameter in CSS pixels
showNumbers?: boolean;
showTicks?: boolean;
tickLength?: number;
tickWidth?: number;
theme?: AnalogClockTheme;
useLocalTime?: boolean; // if true, use local system time (default true)
}


const DEFAULT_THEME: AnalogClockTheme = {
face: '#ffffff',
border: '#222222',
hourMark: '#222222',
hourHand: '#222222',
minuteHand: '#222222',
secondHand: '#c0392b',
number: '#222222'
};


const DEFAULT_OPTIONS: Required<Pick<AnalogClockOptions, 'size' | 'showNumbers' | 'showTicks' | 'tickLength' | 'tickWidth' | 'theme' | 'useLocalTime'>> = {
size: 150,
showNumbers: true,
showTicks: true,
tickLength: 8,
tickWidth: 2,
theme: DEFAULT_THEME,
useLocalTime: true
};

export class AnalogClock {
private container: HTMLElement;
private canvas: HTMLCanvasElement;
private ctx: CanvasRenderingContext2D;
private options: Required<AnalogClockOptions>;
private rafId: number | null = null;
private running = false;
private manualTime: Date | null = null;
  
constructor(container: HTMLElement, options?: AnalogClockOptions) {
this.container = container;
this.options = { ...DEFAULT_OPTIONS, ...(options || {}) } as Required<AnalogClockOptions>;


// create canvas
this.canvas = document.createElement('canvas');
this.canvas.style.width = `${this.options.size}px`;
this.canvas.style.height = `${this.options.size}px`;
this.canvas.width = this.options.size;
this.canvas.height = this.options.size;
this.container.appendChild(this.canvas);


const ctx = this.canvas.getContext('2d');
if (!ctx) throw new Error('Canvas 2D not supported in this environment');
this.ctx = ctx;


// handle HiDPI
this.resizeForHiDPI();
window.addEventListener('resize', this.handleWindowResize);


// initial draw
this.draw();
  }
  private handleWindowResize = () => {
this.resizeForHiDPI();
  }
  
  private resizeForHiDPI() {
const dpr = window.devicePixelRatio || 1;
const cssSize = this.options.size;
this.canvas.width = Math.round(cssSize * dpr);
this.canvas.height = Math.round(cssSize * dpr);
this.canvas.style.width = `${cssSize}px`;
this.canvas.style.height = `${cssSize}px`;
this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  start() {
if (this.running) return;
this.running = true;
const loop = () => {
this.draw();
this.rafId = requestAnimationFrame(loop);
};
loop();
}


stop() {
if (this.rafId != null) cancelAnimationFrame(this.rafId);
this.rafId = null;
this.running = false;
}


setTime(date: Date | null) {
this.manualTime = date;
this.draw();
}


updateOptions(opts: Partial<AnalogClockOptions>) {
this.options = { ...this.options, ...(opts as any) };
// merge theme if provided partially
if (opts.theme) {
this.options.theme = { ...this.options.theme, ...(opts.theme as AnalogClockTheme) };
}
this.canvas.style.width = `${this.options.size}px`;
this.canvas.style.height = `${this.options.size}px`;
this.resizeForHiDPI();
this.draw();
  }
  private getCurrentTime(): Date {
if (this.manualTime) return new Date(this.manualTime.getTime());
return this.options.useLocalTime ? new Date() : new Date(); // placeholder for potential timezone support
  }
  
  private draw() {
const ctx = this.ctx;
  const size = this.options.size;  
  ctx.clearRect(0, 0, size, size);
const cx = size / 2;
const cy = size / 2;
const radius = Math.min(cx, cy) - 4;


// face
ctx.beginPath();
ctx.fillStyle = this.options.theme.face;
ctx.strokeStyle = this.options.theme.border;
ctx.lineWidth = 4;
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();


// ticks
if (this.options.showTicks) this.drawTicks(ctx, cx, cy, radius);


// numbers
if (this.options.showNumbers) this.drawNumbers(ctx, cx, cy, radius);


// hands
const now = this.getCurrentTime();
const hours = now.getHours() % 12;
const minutes = now.getMinutes();
const seconds = now.getSeconds();
const milliseconds = now.getMilliseconds();


const secondWithFrac = seconds + milliseconds / 1000;


// hour hand
const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
this.drawHand(ctx, cx, cy, hourAngle, radius * 0.5, 6, this.options.theme.hourHand);


// minute hand
const minuteAngle = ((minutes + secondWithFrac / 60) / 60) * Math.PI * 2 - Math.PI / 2;
this.drawHand(ctx, cx, cy, minuteAngle, radius * 0.75, 4, this.options.theme.minuteHand);


// second hand
const secondAngle = (secondWithFrac / 60) * Math.PI * 2 - Math.PI / 2;
this.drawHand(ctx, cx, cy, secondAngle, radius * 0.85, 2, this.options.theme.secondHand, true);


// center dot
ctx.beginPath();
ctx.fillStyle = this.options.theme.border;
ctx.arc(cx, cy, 4, 0, Math.PI * 2);
ctx.fill();
  }
  
  private drawTicks(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
ctx.save();
ctx.translate(cx, cy);
for (let i = 0; i < 60; i++) {
const angle = (i / 60) * Math.PI * 2;
const len = (i % 5 === 0) ? this.options.tickLength : Math.floor(this.options.tickLength / 2);
const lw = (i % 5 === 0) ? this.options.tickWidth : Math.max(1, Math.floor(this.options.tickWidth / 2));
ctx.beginPath();
ctx.strokeStyle = this.options.theme.hourMark;
ctx.lineWidth = lw;
const x1 = Math.cos(angle) * (radius - len);
const y1 = Math.sin(angle) * (radius - len);
const x2 = Math.cos(angle) * radius;
const y2 = Math.sin(angle) * radius;
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();
}
ctx.restore();
  }
  
  private drawNumbers(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
ctx.save();
ctx.translate(cx, cy);
ctx.fillStyle = this.options.theme.number;
ctx.font = `${Math.floor(radius * 0.12)}px sans-serif`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
for (let n = 1; n <= 12; n++) {
const ang = (n / 12) * Math.PI * 2 - Math.PI / 2;
const x = Math.cos(ang) * (radius * 0.78);
const y = Math.sin(ang) * (radius * 0.78);
ctx.fillText(String(n), x, y);
}
ctx.restore();
  }
  private drawHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, length: number, width: number, color: string, isSecond = false) {
ctx.save();
ctx.beginPath();
ctx.translate(cx, cy);
ctx.rotate(angle);
ctx.lineCap = 'round';
ctx.strokeStyle = color;
ctx.lineWidth = width;
ctx.moveTo(0,0); 
ctx.lineTo(length, 0);
ctx.stroke();
ctx.restore();
  }
  destroy() {
this.stop();
window.removeEventListener('resize', this.handleWindowResize);
if (this.canvas.parentElement === this.container) {
this.container.removeChild(this.canvas);
}
}
}

