import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgetPasswordComponent } from './forget-password.component';
import { ForgetPasswordRoutingModule } from './forget-password-routing.module';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { CommonViewModule } from '../../shared/common/common.module';

@NgModule({
  declarations: [ForgetPasswordComponent],
  imports: [
    CommonModule,
    ForgetPasswordRoutingModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    MessagesModule,
    PasswordModule,
    CommonViewModule,
  ],
  providers: [],
})
export class ForgetPasswordModule {}
