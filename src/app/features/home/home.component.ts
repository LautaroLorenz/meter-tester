import { Component, OnInit } from '@angular/core';
import { IpcService } from '../../services/ipc.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private ipcService: IpcService) {}

  ngOnInit(): void {
    console.log('HomeComponent INIT');

    this.ipcService
      .invoke('get-database-path')
      .then((res) => console.log(res))
      .catch(() => console.log('no se pudo cargar dirname'));
    setTimeout(() => {
      this.ipcService
        .invoke('get-database-path')
        .then((res) => console.log(res))
        .catch(() => console.log('no se pudo cargar dirname'));
    }, 5000);
  }
}
