import { Component } from '@angular/core';
import { SvgContainerComponent } from '@components/svg-container/svg-container.component';
import { SvgDragDropDirective } from '@directives/svg/svg-drag-drop.directive';
import { SvgPanDirective } from '@directives/svg/svg-pan.directive';
import { SvgSelectableDirective } from '@directives/svg/svg-selectable.directive';
import { SvgZoomDirective } from '@directives/svg/svg-zoom.directive';

@Component({
  selector: 'aor-svg-editor',
  standalone: true,
  imports: [SvgContainerComponent, SvgZoomDirective, SvgPanDirective, SvgDragDropDirective, SvgSelectableDirective],
  templateUrl: './svg-editor.page.html',
  styleUrl: './svg-editor.page.css',
})
export class SvgEditorPage {}
