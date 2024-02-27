import { Component, ElementRef, NgZone, Signal, computed, effect, inject, viewChild } from '@angular/core';
import { Circle, SVG, Svg } from '@svgdotjs/svg.js';

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
      const plantImage = this.draw.image('assets/imgs/TeslaLUD.png');
      plantImage.size(800, 1000);
      const r1 = this.draw.rect(100, 100).fill('red').addClass('myclass');
      r1.element('title').words("I'm a animated rectangle");
      const defs = this.draw.defs();
      const layer = this.draw.group();
      defs.add(layer);
      const c1 = new Circle({ r: 50, cx: 150, cy: 150, id: 'prueba-circle' }).move(100, 100);
      c1.element('title').words("I'm a circle");
      layer.add(c1);
      layer.circle(50);
      this.draw.use(layer).move(300, 500).fill('blue');
      this.draw.use(layer).move(500, 300).fill('green');

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
}
