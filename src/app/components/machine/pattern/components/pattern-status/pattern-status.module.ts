import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternStatusComponent } from './pattern-status.component';
import { TableModule } from 'primeng/table';



@NgModule({
  declarations: [
    PatternStatusComponent
  ],
  imports: [
    CommonModule,
    TableModule
  ],
  exports: [
    PatternStatusComponent
  ]
})
export class PatternStatusModule { }
