import { Component, OnInit } from '@angular/core';
import { SocketIoService } from './core/socket-io.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private _socketService: SocketIoService
  ) {
  }

  ngOnInit() {
    this._socketService.registerSocketIoConnection();
  }
}
