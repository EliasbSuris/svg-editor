import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Element as SvgElement, Point, SVG, Svg } from '@svgdotjs/svg.js';

@Directive({
  selector: '[aorSvgDragDrop]',
  standalone: true,
})
export class SvgDragDropDirective {
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private draw!: Svg;

  private selectedElement!: SvgElement | null;
  private isElementWithOverlay = false;
  private offset!: Point;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('mousedown', event => this.startDrag(event as MouseEvent));
        this.draw.on('mousemove', event => this.drag(event as MouseEvent));
        this.draw.on('mouseup', () => this.endDrag());
        this.draw.on('mouseleave', () => this.endDrag());
      });
    });
  }

  private startDrag(evt: MouseEvent): void {
    if (!evt.target) {
      return;
    }
    const targetElement = evt.target as Element;
    console.log(evt, targetElement, targetElement.classList.contains('draggable'), targetElement.id);
    if (targetElement.classList.contains('draggable') && targetElement.id) {
      const id = targetElement.id;
      const svgTarget = SVG(`#${id}`);
      console.log(svgTarget.parent());
      this.isElementWithOverlay = id.includes('-overlay');
      if (this.isElementWithOverlay) {
        this.selectedElement = svgTarget.parent() as SvgElement;
      } else {
        this.selectedElement = svgTarget;
      }

      this.offset = this.draw.point(evt.clientX, evt.clientY);
      this.offset.x -= Number(svgTarget.x());
      this.offset.y -= Number(svgTarget.y());
    }
  }

  private drag(evt: MouseEvent): void {
    if (this.selectedElement) {
      evt.preventDefault();
      const svgPoint = this.draw.point(evt.clientX, evt.clientY);
      if (this.isElementWithOverlay) {
        // TODO: applying move to a G containing a USE element causes strange move for the USE element
        // Applying move for each element one by one works
        this.selectedElement.each((i, children) =>
          children[i].move(svgPoint.x - this.offset.x, svgPoint.y - this.offset.y)
        );
      } else {
        this.selectedElement.move(svgPoint.x - this.offset.x, svgPoint.y - this.offset.y);
      }
    }
  }
  private endDrag(): void {
    this.selectedElement = null;
  }
}
