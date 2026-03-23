import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { ApplicantLoginComponent } from './applicant-login/applicant-login.component';
import { AppModule } from '../../app.module';
import { CommonViewModule } from '../../shared/common/common.module';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    ToggleButtonModule, 
    MessagesModule,
    PasswordModule,
    SplitterModule,
    CommonViewModule,
    DialogModule
  ],
  declarations: [LoginComponent, ApplicantLoginComponent],
})
export class LoginModule {
  msgs: Message[] = [];
}
