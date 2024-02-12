import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputFocusedDirective } from './input-focused.directive';
// import { TrackHeightDirective } from './track-height.directive';

const EmetsyDirectives = [
  InputFocusedDirective,
  // TrackHeightDirective
];

@NgModule({
  declarations: [EmetsyDirectives],
  imports: [CommonModule],
  exports: [EmetsyDirectives],
  providers: [],
})
export class DirectivesModule {}
