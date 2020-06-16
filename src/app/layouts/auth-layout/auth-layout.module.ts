import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import {AuthLayoutComponent} from './auth-layout.component'
import {LoginComponent} from './login/login.component';
import {SignUpComponent} from './sign-up/sign-up.component';
import { RapportComponent } from './rapport/rapport.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AuthLayoutRoutes),
        FormsModule,
        HttpClientModule,
        NgbModule,
        MatProgressSpinnerModule
    ],
  declarations: [
    LoginComponent,
    SignUpComponent,
    RapportComponent
  ],
  bootstrap:[AuthLayoutComponent],
})
export class AuthLayoutModule { }
