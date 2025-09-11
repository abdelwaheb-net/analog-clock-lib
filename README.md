# analog-clock-lib


A small TypeScript library to render a customizable analog clock using an HTML Canvas element.


## Features


- Lightweight and dependency-free
- Configurable size, themes and display options
- Simple API: create, start, stop, update options
- Written in TypeScript (types included)


## Quick install


```bash
npm install analog-clock-lib
```


## Quick usage


```html
<div id="clock"></div>
<script type="module">
import { AnalogClock } from "analog-clock-lib";


const container = document.getElementById('clock');
const clock = new AnalogClock(container!, {
size: 220,
showNumbers: true,
theme: {
face: '#ffffff',
border: '#333333',
hourHand: '#333333',
minuteHand: '#333333',
secondHand: '#d23f3f'
}
});
clock.start();
</script>
```


## API


- `new AnalogClock(container: HTMLElement, options?: AnalogClockOptions)` — create a clock instance
- `start()` — begin the animation loop
- `stop()` — stop the animation
- `setTime(date: Date)` — manually set displayed time (optional)
- `updateOptions(opts: Partial<AnalogClockOptions>)` — update configuration