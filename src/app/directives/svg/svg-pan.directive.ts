import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Svg } from '@svgdotjs/svg.js';

@Directive({
  selector: '[aorSvgPan]',
  standalone: true,
})
export class SvgPanDirective {
  public isPanning: boolean = false;
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private draw!: Svg;
  private panStartX: number = 0;
  private panStartY: number = 0;
  private isMouseDown: boolean = false;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('mousedown', event => {
          const mouseEvent = event as MouseEvent;
          event.preventDefault();
          if (mouseEvent.button === 1 || mouseEvent.button === 0) {
            // Check if the middle mouse button (wheel) is pressed
            this.isMouseDown = true;
            this.startPan(mouseEvent);
          }
        });
        this.draw.on('mouseup', event => {
          const mouseEvent = event as MouseEvent;
          mouseEvent.preventDefault();
          if (mouseEvent.button === 1 || mouseEvent.button === 0) {
            // Check if the middle mouse button (wheel) is released
            this.isMouseDown = false;
            this.endPan();
          }
        });
        this.draw.on('mouseleave', () => this.endPan());
        this.draw.on('mousemove', event => {
          const mouseEvent = event as MouseEvent;
          mouseEvent.preventDefault();
          if (this.isMouseDown) {
            // Check if the middle mouse button (wheel) is currently pressed
            this.pan(mouseEvent);
          }
        });
      });
    });
  }

  private startPan(event: MouseEvent): void {
    if (this.isTargetDraggable(event.target as Element)) {
      return;
    }
    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.togglePanningCursor(true);
  }

  private togglePanningCursor(show: boolean): void {
    if (!this.draw) {
      return;
    }
    show ? this.draw.css('cursor', 'grabbing') : this.draw.css('cursor', 'default');
  }

  private endPan(): void {
    this.isPanning = false;
    this.togglePanningCursor(false);
  }

  private pan(event: MouseEvent): void {
    if (!this.draw) {
      return;
    }

    if (this.isPanning) {
      // Get the bounding box of the SVG element
      const svgBox = this.draw?.rbox();

      if (!svgBox) {
        return;
      }

      // Calculate the distance the mouse has moved since the last pan event
      const deltaX = event.clientX - this.panStartX;
      const deltaY = event.clientY - this.panStartY;

      // Update the pan start position to the current mouse position
      this.panStartX = event.clientX;
      this.panStartY = event.clientY;

      // Get the current viewBox
      const viewBox = this.draw.viewbox();
      if (!viewBox) {
        return;
      }
      // Calculate the new viewBox position based on the mouse movement and current zoom level
      const newX = viewBox.x - (deltaX / svgBox.width) * viewBox.width;
      const newY = viewBox.y - (deltaY / svgBox.height) * viewBox.height;

      // Set the new viewBox
      this.draw.viewbox(newX, newY, viewBox.width, viewBox.height);
    }
  }

  private isTargetDraggable(target: Element): boolean {
    return target.classList.contains('draggable');
  }
}
