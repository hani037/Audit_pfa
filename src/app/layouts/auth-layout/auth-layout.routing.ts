import { Routes } from '@angular/router';

import {LoginComponent} from './login/login.component';
import {SignUpComponent} from './sign-up/sign-up.component';
import {RapportComponent} from "./rapport/rapport.component";
import {AuditGuardService} from "../admin-layout/audit-guard.service";


export const AuthLayoutRoutes: Routes = [
    { path: 'login',
      component: LoginComponent
    },
  { path: 'sign-up',
    component: SignUpComponent
  },
  {
    path:'rapport',
    component:RapportComponent,
    canActivate:[AuditGuardService]
  }
];
