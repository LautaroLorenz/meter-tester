import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { PageUrlName } from '../../models/business/enums/page-name.model';

@Component({
  templateUrl: './history-essay.component.html',
  styleUrls: ['./history-essay.component.scss'],
})
export class HistoryEssayComponent {
  readonly title: string = 'Historial de ejecución';

  constructor(
    // TODO
    // private readonly route: ActivatedRoute,
    private readonly navigationService: NavigationService
  ) // TODO
  // private readonly fb: FormBuilder,
  // private readonly dbServiceSteps: DatabaseService<Step>,
  // private readonly messagesService: MessagesService,
  // private readonly essayService: EssayService,
  // private readonly dbService: DatabaseService<EssayTemplate>,
  // private readonly dbServiceEssayTemplateStep: DatabaseService<EssayTemplateStep>,
  // private readonly confirmationService: ConfirmationService
  {
    // TODO
    // this.form = this.buildForm();
    // this.saveButtonMenuItems = this.getSaveButtonMenuItems();
    // this.id$ = this.getId$();
  }

  exit(): void {
    this.navigationService.back({ targetPage: PageUrlName.history });
  }
}
