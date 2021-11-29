import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketIoService } from '../core/socket-io.service';

@Injectable({
  providedIn: 'root'
})
export class JoinRoomGuard implements CanActivate {

  constructor(
    private _socketService: SocketIoService,
    private _router: Router
  ) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this._socketService.joinRoom(state.url.slice(-8));
    return this._socketService.joinRoom$.pipe(map(num => {
      if (num !== 1) {
        const urlTree = this._router.createUrlTree(['home'], {
          queryParams: {
            err: num
          }
        });
        return urlTree;
      }
      return true;
    }));
  }

}
