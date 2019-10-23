import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppComponent } from './app.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';

import { ShifttableComponent } from './shifttable/shifttable.component';
import { ShiftTableService } from './shared/shifttable.service';
import { SidenavComponent, SidenavComponentImportExportDialog } from './sidenav/sidenav.component';

@NgModule({
  declarations: [
    AppComponent,
    ShifttableComponent,
    SidenavComponent,
    SidenavComponentImportExportDialog
  ],
  entryComponents: [SidenavComponentImportExportDialog],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  providers: [
    ShiftTableService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
