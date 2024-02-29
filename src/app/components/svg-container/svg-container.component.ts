import { Component, ElementRef, NgZone, Signal, computed, effect, inject, viewChild } from '@angular/core';
import { Element as SvgElement, Circle, Rect, SVG, Svg } from '@svgdotjs/svg.js';

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
      globalStyle.rule('.draggable', { cursor: 'move' });
      const plantImage = this.draw.image('assets/imgs/TeslaLUD.png');
      plantImage.size(1000, 1000);
      const r1 = this.draw.rect(100, 100).fill('red').addClass('myclass').addClass('draggable');
      r1.id('rect-1');
      r1.element('title').words("I'm a animated rectangle");
      const layer1 = this.draw.group();
      const draggableCircleGroup = layer1.group().id('circle-group').attr('pointer-events', 'visible');
      const draggableCircle = new Circle({ r: 10, cx: 15, cy: 15, id: 'circ-1', class: 'draggable' })
        .fill('none')
        // the rectangular area around the element can also receive pointer events (only Chrome)
        // .attr('pointer-events', 'bounding-box')
        // not painted areas also recieve pointer events
        // .attr('pointer-events', 'visible')
        .stroke({ color: 'blue', width: 2 });
      // .move(400, 400);
      const circleOverlay = this.createOverlay(draggableCircle);
      draggableCircleGroup.add(draggableCircle);
      draggableCircleGroup.add(circleOverlay);
      draggableCircleGroup.move(400, 400);
      const c2 = new Circle({ r: 50, cx: 150, cy: 150, id: 'circ-2' }).move(200, 200).fill('green');
      layer1.add(draggableCircleGroup);
      layer1.add(c2);

      const layer2 = this.draw.group();
      const robotGroup = layer2.group();
      robotGroup.id('robot-group').addClass('draggable').attr('pointer-events', 'visible');
      const robotSvg = robotGroup
        .use('Layer_1', 'assets/imgs/robot-example.svg')
        // .addClass('draggable')
        .id('robot-use')
        .fill('red')
        .size(30, 30);
      const recOverlay = new Rect({ x: 0, y: 0, height: 30, width: 30 })
        .fill('none')
        .addClass('draggable')
        .id('robot-overlay');
      robotGroup.add(recOverlay);
      robotGroup.move(500, 450);
      layer2.hide();
      layer2.show();

      r1.animate(2000, 500, 'now').move(200, 0).animate(2000, 500).dmove(100, 100).animate(1000, 0).size(150, 150);
      this.zone.runOutsideAngular(() => {
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
    const overlay = new Rect(element.bbox()).fill('none').addClass('draggable').id(`${element.id()}-overlay`);
    return overlay;
  }
}
