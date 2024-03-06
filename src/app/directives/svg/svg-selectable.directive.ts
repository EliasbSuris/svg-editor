import { Directive, NgZone, effect, inject } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { Circle, G, SVG, Svg, Element as SvgElement } from '@svgdotjs/svg.js';

export const SELECTABLE_CLASS = 'selectable';
export const RESIZABLE_CLASS = 'resizable';
export const RESIZE_CLASS = 'resize';
export const RESIZE_TOP_LEFT_CLASS = 'resize-top-left';
export const RESIZE_TOP_MID_CLASS = 'resize-top-mid';
export const RESIZE_TOP_RIGHT_CLASS = 'resize-top-right';
export const RESIZE_MID_LEFT_CLASS = 'resize-mid-left';
export const RESIZE_MID_RIGHT_CLASS = 'resize-mid-right';
export const RESIZE_BOTTOM_LEFT_CLASS = 'resize-bottom-left';
export const RESIZE_BOTTOM_MID_CLASS = 'resize-bottom-mid';
export const RESIZE_BOTTOM_RIGHT_CLASS = 'resize-bottom-right';

export const RESIZE_ACTION = {
  NONE: 'None',
  LEFT_RESIZE: 'LeftResize',
  TOP_RESIZE: 'TopResize',
  RIGHT_RESIZE: 'RightResize',
  BOTTOM_RESIZE: 'BottomResize',
  TOP_LEFT_RESIZE: 'TopLeftResize',
  BOTTOM_LEFT_RESIZE: 'BottomLeftResize',
  TOP_RIGHT_RESIZE: 'TopRightResize',
  BOTTOM_RIGHT_RESIZE: 'BottomRightResize',
} as const;

type ObjectValues<T> = T[keyof T];

export type ResizeAction = ObjectValues<typeof RESIZE_ACTION>;

@Directive({
  selector: '[aorSvgSelectable]',
  standalone: true,
})
export class SvgSelectableDirective {
  private svgContainerComponent = inject(SvgContainerComponent);
  private zone = inject(NgZone);
  private draw!: Svg;

  private selectedElement!: SvgElement | null;
  private selectedGroup!: G | null;

  private currentResizeAction: ResizeAction = RESIZE_ACTION.NONE;
  private elementToResize!: SvgElement | null;

  constructor() {
    effect(() => {
      this.draw = this.svgContainerComponent.svg();
      this.zone.runOutsideAngular(() => {
        this.draw.on('click', event => this.selectElement(event as PointerEvent));

        this.draw.on('mousemove', event => this.resize(event as PointerEvent));
        this.draw.on('mouseup', () => (this.currentResizeAction = RESIZE_ACTION.NONE));
      });
    });
  }

  private selectElement(event: PointerEvent): void {
    const targetSvgElement = SVG(event.target);
    const parent = targetSvgElement.parent();
    if (this.currentResizeAction !== RESIZE_ACTION.NONE) {
      return;
    }
    if (targetSvgElement.type === 'g') {
      return;
    }
    if (parent?.id() === this.selectedGroup?.id()) {
      return;
    }
    this.unselectElement();
    const selectableElement = parent?.findOne(`.${SELECTABLE_CLASS}`);
    if (parent?.type === 'g' && selectableElement) {
      this.selectedGroup = parent as G;
      this.selectedElement = selectableElement as SvgElement;
      this.createResizePoints(parent as G);
      this.selectedElement?.stroke({ color: 'black', dasharray: '2', opacity: 0.5, width: 1 });
    }
  }

  private unselectElement(): void {
    if (this.selectedElement) {
      this.selectedElement.stroke('none');
      this.deleteResizePoints(this.selectedElement.parent() as G);
      this.selectedElement = null;
      this.selectedGroup = null;
    }
  }

  private createResizePoints(group: G): void {
    const bbox = group.bbox();
    const r = (bbox.width + bbox.height) / 40;
    const topLeft = this.createResizePoint(bbox.x, bbox.y, `${RESIZE_CLASS} ${RESIZE_TOP_LEFT_CLASS}`);
    const topMid = this.createResizePoint(bbox.x + bbox.width / 2, bbox.y, `${RESIZE_CLASS} ${RESIZE_TOP_MID_CLASS}`);
    const topRight = this.createResizePoint(bbox.x + bbox.width, bbox.y, `${RESIZE_CLASS} ${RESIZE_TOP_RIGHT_CLASS}`);
    const midLeft = this.createResizePoint(
      bbox.x,
      bbox.y + bbox.height / 2,
      `${RESIZE_CLASS} ${RESIZE_MID_LEFT_CLASS}`
    );
    const midRight = this.createResizePoint(
      bbox.x + bbox.width,
      bbox.y + bbox.height / 2,
      `${RESIZE_CLASS} ${RESIZE_MID_RIGHT_CLASS}`
    );
    const bottomLeft = this.createResizePoint(
      bbox.x,
      bbox.y + bbox.height,
      `${RESIZE_CLASS} ${RESIZE_BOTTOM_LEFT_CLASS}`
    );
    const bottomMid = this.createResizePoint(
      bbox.x + bbox.width / 2,
      bbox.y + bbox.height,
      `${RESIZE_CLASS} ${RESIZE_BOTTOM_MID_CLASS}`
    );
    const bottomRight = this.createResizePoint(
      bbox.x + bbox.width,
      bbox.y + bbox.height,
      `${RESIZE_CLASS} ${RESIZE_BOTTOM_RIGHT_CLASS}`,
      r
    );
    bottomRight.on('mousedown', evt => {
      evt.preventDefault();
      evt.stopPropagation();
      const resizePoint = SVG(evt.target);
      this.elementToResize = resizePoint.parent()?.findOne(`.${RESIZABLE_CLASS}`) as SvgElement;
      this.currentResizeAction = RESIZE_ACTION.BOTTOM_RIGHT_RESIZE;
    });
    group.add(topLeft);
    group.add(topMid);
    group.add(topRight);
    group.add(midLeft);
    group.add(midRight);
    group.add(bottomLeft);
    group.add(bottomMid);
    group.add(bottomRight);
  }

  private deleteResizePoints(group: G): void {
    group.find(`.${RESIZE_CLASS}`).forEach(element => element.remove());
  }

  private createResizePoint(cx: number, cy: number, customClass: string, r = 1): Circle {
    return new Circle({
      r,
      cx,
      cy,
      class: customClass,
    });
  }

  private resize(event: PointerEvent): void {
    if (this.currentResizeAction === RESIZE_ACTION.NONE) {
      return;
    }
    const { x = 0, y = 0, height = 0, width = 0 } = this.selectedGroup?.bbox() ?? {};
    const finalPoint = this.draw.point(event.clientX, event.clientY);
    const deltaWidth = finalPoint.x - x - width;
    const deltaHeight = finalPoint.y - y - height;
    this.selectedGroup?.size(width + deltaWidth, height + deltaHeight);
    // this.elementToResize?.size(
    //   (this.elementToResize?.width() as number) + 0.5,
    //   (this.elementToResize?.height() as number) + 0.5
    // );
  }
}
