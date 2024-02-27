import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Svg } from '@svgdotjs/svg.js';

@Directive({
  selector: '[aorSvgPan]',
  standalone: true,
})
export class SvgPanDirective {
  public isDragging: boolean = false;
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private draw!: Svg;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private isMouseWheelDown: boolean = false;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('mousedown', event => {
          const mouseEvent = event as MouseEvent;
          event.preventDefault();
          if (mouseEvent.button === 1 || mouseEvent.button === 0) {
            // Check if the middle mouse button (wheel) is pressed
            this.isMouseWheelDown = true;
            this.startDrag(mouseEvent);
          }
        });
        this.draw.on('mouseup', event => {
          const mouseEvent = event as MouseEvent;
          mouseEvent.preventDefault();
          console.log(event);
          if (mouseEvent.button === 1 || mouseEvent.button === 0) {
            // Check if the middle mouse button (wheel) is released
            this.isMouseWheelDown = false;
            this.endDrag(mouseEvent);
          }
        });
        this.draw.on('mouseleave', event => this.endDrag(event as MouseEvent));
        this.draw.on('mousemove', event => {
          const mouseEvent = event as MouseEvent;
          mouseEvent.preventDefault();
          if (this.isMouseWheelDown) {
            // Check if the middle mouse button (wheel) is currently pressed
            this.drag(mouseEvent);
          }
        });
      });
    });
  }

  private startDrag(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.toggleDraggingCursor(true);
  }

  private toggleDraggingCursor(show: boolean): void {
    if (!this.draw) {
      return;
    }
    show ? this.draw.css('cursor', 'grabbing') : this.draw.css('cursor', 'default');
  }

  private endDrag(event: MouseEvent): void {
    this.isDragging = false;
    this.toggleDraggingCursor(false);
  }

  private drag(event: MouseEvent): void {
    if (!this.draw) {
      return;
    }

    if (this.isDragging) {
      // Get the bounding box of the SVG element
      const svgBox = this.draw?.rbox();

      if (!svgBox) {
        return;
      }

      // Calculate the distance the mouse has moved since the last drag event
      const deltaX = event.clientX - this.dragStartX;
      const deltaY = event.clientY - this.dragStartY;

      // Update the drag start position to the current mouse position
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

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
}
