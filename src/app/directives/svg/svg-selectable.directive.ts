import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { SVG, Svg, Element as SvgElement } from '@svgdotjs/svg.js';

export const SELECTABLE_CLASS = 'selectable';

@Directive({
  selector: '[aorSvgSelectable]',
  standalone: true,
})
export class SvgSelectableDirective {
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private draw!: Svg;

  private selectedElement!: SvgElement | null;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('click', event => this.selectElement(event as PointerEvent));
      });
    });
  }

  private selectElement(event: PointerEvent): void {
    this.unselectElement();
    const targetSvgElement = SVG(event.target);
    // Selectable overlay could be in top or bottom of the contained element
    if (targetSvgElement.classes().includes(SELECTABLE_CLASS)) {
      this.selectedElement = targetSvgElement;
    } else {
      const parent = targetSvgElement.parent();
      const selectableElement = parent?.findOne(`.${SELECTABLE_CLASS}`);
      if (parent?.type === 'g' && selectableElement) {
        this.selectedElement = selectableElement as SvgElement;
      }
    }
    this.selectedElement?.stroke({ color: 'black', dasharray: '2', opacity: 0.7, width: 1 });
  }

  private unselectElement(): void {
    if (this.selectedElement) {
      this.selectedElement.stroke('none');
      this.selectedElement = null;
    }
  }
}
