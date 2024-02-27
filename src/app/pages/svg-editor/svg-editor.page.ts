import { Component } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { SvgPanDirective } from '@directives/svg/svg-pan.directive';
import { SvgZoomDirective } from '@directives/svg/svg-zoom.directive';

@Component({
  selector: 'aor-svg-editor',
  standalone: true,
  imports: [SvgContainerComponent, SvgZoomDirective, SvgPanDirective],
  templateUrl: './svg-editor.page.html',
  styleUrl: './svg-editor.page.css',
})
export class SvgEditorPage {}
