import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Element as SvgElement, Point, SVG, Svg } from '@svgdotjs/svg.js';

export const DRAGGABLE_CLASS = 'draggable';
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
    const targetSvgElement = SVG(evt.target);
    if (targetSvgElement.classes().includes(DRAGGABLE_CLASS)) {
      const id = targetSvgElement.id();
      this.isElementWithOverlay = id.includes('-overlay');
      if (this.isElementWithOverlay) {
        this.selectedElement = targetSvgElement.parent() as SvgElement;
      } else {
        this.selectedElement = targetSvgElement;
      }
      this.offset = this.draw.point(evt.clientX, evt.clientY);
      // this.offset.x -= Number(this.selectedElement.x());
      this.offset.x -= Number(targetSvgElement.x());
      // this.offset.y -= Number(this.selectedElement.y());
      this.offset.y -= Number(targetSvgElement.y());
    }
  }

  private drag(evt: MouseEvent): void {
    // TODO: drag after resize not working as expected
    if (this.selectedElement) {
      evt.preventDefault();
      const svgPoint = this.draw.point(evt.clientX, evt.clientY);
      const isUseElement = this.selectedElement.children().some(element => element.type === 'use');
      if (isUseElement) {
        // TODO: applying move to a G containing a USE element causes strange behaviour on USE element movement
        // Workaround: applying move for each element one by one
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
