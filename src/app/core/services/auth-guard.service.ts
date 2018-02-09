/*
* Copyright 2018 herd-ui contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from './config.service';
import { UserService } from './user.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private configService: ConfigService,
    private currentUserService: UserService,
    private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    // if logged in
    if (this.currentUserService.isAuthenticated) {
      return true;
      // If not logged in but we want to attempt to initialize the user information
      // due to APP_INITIALIZER based authentication happening
    } else if (!this.configService.config.useBasicAuth) {
      return this.currentUserService.getCurrentUser().map((resp) => {
        if (resp.userId) {
          return true;
        }
      }).catch((e) => {
        this.router.navigate(['/login'], {
          replaceUrl: true,
          queryParams: {
            returnUrl: state.url,
          }
        });
        return Observable.of(false);
      });
    } else {
      this.router.navigate(['/login'],  {
        replaceUrl: true,
        queryParams: {
          returnUrl: state.url
        }
      });
      return false;
    }
  }
}
