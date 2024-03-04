import { Component, ElementRef, NgZone, Signal, computed, effect, inject, viewChild } from '@angular/core';
import { DRAGGABLE_CLASS } from '@directives/svg/svg-drag-drop.directive';
import { SELECTABLE_CLASS } from '@directives/svg/svg-selectable.directive';
import { Circle, Rect, RectAttr, SVG, Svg, Element as SvgElement, Use } from '@svgdotjs/svg.js';

@Component({
  selector: 'aor-svg-container',
  standalone: true,
  imports: [],
  templateUrl: './svg-container.component.html',
  styleUrl: './svg-container.component.css',
})
export class SvgContainerComponent {
  public draw!: Svg;
  public svg: Signal<Svg> = computed(() => SVG().addTo(this.svgContainer().nativeElement).size('100%', '100%'));
  private zone = inject(NgZone);
  private svgContainer = viewChild.required<ElementRef>('svgContainer');

  constructor() {
    effect(() => {
      this.draw = this.svg();
      this.draw.viewbox({
        height: 800,
        width: 1000,
        x: 0,
        y: 0,
      });
      const globalStyle = this.draw.style();
      globalStyle.rule('.myclass:hover', { filter: 'brightness(50%)' });
      globalStyle.rule(`.${DRAGGABLE_CLASS}`, { cursor: 'move' });
      const plantImage = this.draw.image('assets/imgs/TeslaLUD.png');
      plantImage.size(1000, 1000);
      const r1 = this.draw.rect(100, 100).fill('red').addClass('myclass').addClass(DRAGGABLE_CLASS);
      r1.id('rect-1');
      r1.element('title').words("I'm a animated rectangle");
      const layer1 = this.draw.group();
      const draggableCircleGroup = layer1.group().id('circle-group').attr('pointer-events', 'visible');
      const draggableCircle = new Circle({ r: 10, cx: 15, cy: 15, id: 'circ-1', class: DRAGGABLE_CLASS })
        .fill({ color: 'blue', opacity: 0.5 })
        // the rectangular area around the element can also receive pointer events (only Chrome)
        // .attr('pointer-events', 'bounding-box')
        // not painted areas also recieve pointer events
        // .attr('pointer-events', 'visible')
        .stroke({ color: 'blue', width: 1 });
      // .move(400, 400);
      const circleOverlay = this.createOverlay(draggableCircle);
      draggableCircleGroup.add(draggableCircle);
      draggableCircleGroup.add(circleOverlay);
      draggableCircleGroup.move(400, 400);
      // draggableCircle.translate(5, 5);
      const c2 = new Circle({ r: 50, cx: 150, cy: 150, id: 'circ-2' }).move(200, 200).fill('green');
      layer1.add(draggableCircleGroup);
      layer1.add(c2);

      const layer2 = this.draw.group();
      const robotGroup = layer2.group();
      robotGroup.id('robot-group').addClass(DRAGGABLE_CLASS).attr('pointer-events', 'visible');
      const useRobot = robotGroup
        .use('Layer_1', 'assets/imgs/robot-example.svg')
        // .addClass('draggable')
        .id('robot-use')
        .fill('red')
        .size(30, 30);
      robotGroup.add(this.createUseOverlay({ height: 30, width: 30, x: 0, y: 0 }, useRobot));
      robotGroup.move(500, 450);
      layer2.hide();
      layer2.show();

      this.zone.runOutsideAngular(() => {
        r1.animate(2000, 500, 'now').move(200, 0).animate(2000, 500).dmove(100, 100).animate(1000, 0).size(150, 150);
        r1.mouseover(() => {
          r1.timeline().pause();
        });
        r1.mouseleave(() => {
          r1.timeline().play();
        });
      });
    });
  }

  private createOverlay(element: SvgElement): Rect {
    const { height, width, x, y } = element.bbox();
    return new Rect({ height, width, x, y })
      .fill('none')
      .addClass(DRAGGABLE_CLASS)
      .addClass(SELECTABLE_CLASS)
      .id(`${element.id()}-overlay`);
  }

  private createUseOverlay(rectAttr: RectAttr, useElement: Use): Rect {
    return new Rect(rectAttr)
      .fill('none')
      .addClass(DRAGGABLE_CLASS)
      .addClass(SELECTABLE_CLASS)
      .id(`${useElement.id()}-overlay`);
  }
}
