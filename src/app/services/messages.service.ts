import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private messageInfoLifeMs = 5000;
  private messageWarnLifeMs = 5000;
  private messageSuccessLifeMs = 1250;

  constructor(private readonly messageService: MessageService) {}

  public info(message: string, sticky = false): void {
    const config: Message = {
      severity: 'info',
      summary: 'Información',
      detail: message,
    };

    if (sticky) {
      config.sticky = true;
    } else {
      config.life = this.messageInfoLifeMs;
    }

    this.messageService.add(config);
  }

  public warn(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: message,
      life: this.messageWarnLifeMs,
    });
  }

  public success(message: string, extraLife = 0): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Realizado',
      detail: message,
      life: this.messageSuccessLifeMs + extraLife,
    });
  }

  public error(message: string): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      sticky: true,
    });
  }
}
