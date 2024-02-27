import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Svg, ViewBoxLike } from '@svgdotjs/svg.js';
import { SvgPanDirective } from './svg-pan.directive';

@Directive({
  selector: '[aorSvgZoom]',
  standalone: true,
})
export class SvgZoomDirective {
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private svgPanDirective = inject(SvgPanDirective, { optional: true });
  private draw!: Svg;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('wheel', event => this.zoom(event as WheelEvent), null, { passive: true });
      });
    });
  }

  private zoom(event: WheelEvent): void {
    if (this.svgPanDirective?.isPanning) {
      return;
    }
    if (!this.draw) {
      return;
    }

    const svgPoint = this.draw.point(event.clientX, event.clientY);

    const zoomAmount = event.deltaY > 0 ? 1.1 : 0.9;

    const oldViewBox = this.draw.viewbox();
    if (!oldViewBox) {
      return;
    }
    const newViewBox: ViewBoxLike = {
      x: svgPoint.x - (svgPoint.x - oldViewBox.x) * zoomAmount,
      y: svgPoint.y - (svgPoint.y - oldViewBox.y) * zoomAmount,
      width: oldViewBox.width * zoomAmount,
      height: oldViewBox.height * zoomAmount,
    };
    this.draw.viewbox(newViewBox);
  }
}
