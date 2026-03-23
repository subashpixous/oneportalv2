import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SliderModule } from 'primeng/slider';
import { ErrorMsgComponent } from '../error-msg/error-msg.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { OverlayModule } from 'primeng/overlay';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';
import { DividerModule } from 'primeng/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PasswordModule } from 'primeng/password';
import { GoogleMapsModule } from '@angular/google-maps';
import { StepsModule } from 'primeng/steps';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [ErrorMsgComponent],
  exports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    CalendarModule,
    ChipsModule,
    DropdownModule,
    InputMaskModule,
    InputNumberModule,
    ColorPickerModule,
    CascadeSelectModule,
    MultiSelectModule,
    ToggleButtonModule,
    SliderModule,
    InputTextareaModule,
    RadioButtonModule,
    InputTextModule,
    RatingModule,
    ChipModule,
    KnobModule,
    InputSwitchModule,
    ListboxModule,
    SelectButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    ButtonModule,
    ErrorMsgComponent,
    ConfirmPopupModule,
    FieldsetModule,
    AccordionModule,
    OverlayModule,
    OverlayPanelModule,
    DialogModule,
    ToastModule,
    TableModule,
    FileUploadModule,
    MenuModule,
    PaginatorModule,
    TimelineModule,
    CardModule,
    TagModule,
    BreadcrumbModule,
    TabViewModule,
    TabMenuModule,
    DividerModule,
    DragDropModule,
    PasswordModule,
    GoogleMapsModule,
    StepsModule,
    EditorModule,
    ConfirmDialogModule,
  ],
  imports: [CommonModule],
})
export class UiModule {}
