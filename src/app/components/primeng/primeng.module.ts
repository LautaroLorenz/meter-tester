import { ConfirmationService, MessageService } from 'primeng/api';

import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { SplitterModule } from 'primeng/splitter';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SpeedDialModule } from 'primeng/speeddial';
import { DragDropModule } from 'primeng/dragdrop';
import { OrderListModule } from 'primeng/orderlist';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { TerminalModule } from 'primeng/terminal';
import { NgModule } from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';

const PrimeNgModules = [
  MenubarModule,
  CardModule,
  FieldsetModule,
  PanelModule,
  ToolbarModule,
  ButtonModule,
  InputTextModule,
  TableModule,
  DividerModule,
  ConfirmDialogModule,
  ToastModule,
  DialogModule,
  DropdownModule,
  InputNumberModule,
  TooltipModule,
  RippleModule,
  CheckboxModule,
  MenuModule,
  TabMenuModule,
  SplitterModule,
  SplitButtonModule,
  SpeedDialModule,
  DragDropModule,
  OrderListModule,
  InputSwitchModule,
  SelectButtonModule,
  OverlayPanelModule,
  MessagesModule,
  MessageModule,
  ProgressSpinnerModule,
  ChartModule,
  ProgressBarModule,
  StepsModule,
  FileUploadModule,
  TerminalModule,
  ListboxModule,
  BadgeModule
];

const PrimeNgServices = [MessageService, ConfirmationService];

@NgModule({
  imports: [PrimeNgModules],
  exports: [PrimeNgModules],
  providers: [PrimeNgServices],
})
export class PrimeNgModule {}
