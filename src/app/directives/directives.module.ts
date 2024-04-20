import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFocusedDirective } from './input-focused.directive';
import { AbmColumnTemplateNameDirective } from './abm-column-template-name.directive';

const EmetsyDirectives = [
  InputFocusedDirective,
  AbmColumnTemplateNameDirective,
];

@NgModule({
  declarations: [EmetsyDirectives],
  imports: [CommonModule],
  exports: [EmetsyDirectives],
  providers: [],
})
export class DirectivesModule {}
