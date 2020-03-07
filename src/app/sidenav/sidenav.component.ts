import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {NAMES_KEY_LS, ShiftTableService, TIMES_KEY_LS} from "../shared/shifttable.service";
import {EmployeeRow, EmployeeRowInterface} from "../shared/employee";
import {Shift, ShiftInterface} from "../shared/shift";

export interface ImportExportDialogData {
  elementType: ImpExElementType;
  title: string;
}
enum ImpExElementType {
  Plan,
  Employees,
  Times
}
const elementTypes: ImpExElementType[] = [ImpExElementType.Plan, ImpExElementType.Employees, ImpExElementType.Times];
const infoTextEmployees = "Bitte geben Sie die Namen der Mitarbeiter ein und trennen sie diese mit einem Komma. Beispiel:<br> " +
  "<b>Max,Erika,Maria,Sabine</b> <br> Falls bereits Daten vorhanden sind, können Namen aus der angezeigten Auflistung hinzugefügt oder entfernt werden.";
const infoTextTimes = "Bitte geben Sie die Zeiträume (oder Bezeichnungen) der Schichten ein und trennen sie diese mit einem Komma. Beispiel:<br> " +
  "<b>05:45-14:00,07:00-15:00,12:00-20:30,Urlaub,Schule</b> <br> Falls bereits Daten vorhanden sind, können Schichten aus der angezeigten Auflistung hinzugefügt oder entfernt werden.";
const infoTextPlan = "Die angezeigten Daten beinhalten alle Informationen der gerade angezeigten Woche (d.h. alle Schichten und Namen). " +
  "Um die Daten dieser Woche auf ein anderes Gerät zu übertragen, kann der angezeigte Inhalt kopiert und auf dem anderen Gerät eingefügt werden.";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  @Input() sidenav;
  actionTypes: ImpExElementType[];

  constructor(public dialog: MatDialog, private shiftTableService: ShiftTableService) {
    this.actionTypes = elementTypes;
  }

  ngOnInit() {
  }

  openImportExportDialog(elementType: ImpExElementType, title: String) {
    const dialogRef = this.dialog.open(SidenavComponentImportExportDialog, {
      width: '75%',
      data: {elementType: elementType, title: title}
    });

    //Does nothing. Just to show an API example method
    dialogRef.afterClosed().subscribe(result => {
      //console.log(`Dialog result: ${result}`);
    });
  }

  refreshNamesAfterNameImport(){
    this.shiftTableService.refreshNamesAfterNameImport();
    this.sidenav.toggle();
  }

}


@Component({
  selector: 'sidenav-dialog',
  templateUrl: 'dialogs/sidenav.component.importdialog.html',
  styles: ['mat-form-field { width: 100%;}']
})
export class SidenavComponentImportExportDialog implements OnInit {
  inputData: String;
  showError: Boolean;
  showInfo: Boolean;
  @ViewChild('exportText', {static: false})
  exportTextElement;
  infoText: String;

  constructor(
    public dialogRef: MatDialogRef<SidenavComponentImportExportDialog>, @Inject(MAT_DIALOG_DATA) public data: ImportExportDialogData, private shiftTableService: ShiftTableService) {
  }

  ngOnInit() {
    this.showInfo = true;

    if(this.data.elementType === ImpExElementType.Plan) {
      this.inputData = this.createExportPlanData();
      this.infoText = infoTextPlan;
    }
    else if(this.data.elementType === ImpExElementType.Employees) {
      this.inputData = this.createExportListData(NAMES_KEY_LS);
      this.infoText = infoTextEmployees;
    }
    else if(this.data.elementType === ImpExElementType.Times) {
      this.inputData = this.createExportListData(TIMES_KEY_LS);
      this.infoText = infoTextTimes;
    }
  }

  createExportPlanData(): string {
    let yearWeek = new Date().getFullYear() + "-" + this.shiftTableService.getSelectedWeekNumber();
    let employeeRows: EmployeeRow[] = JSON.parse(localStorage.getItem(yearWeek));

    let shifts;
    if(localStorage.getItem(TIMES_KEY_LS) ){
      shifts = JSON.parse(localStorage.getItem(TIMES_KEY_LS));
    } else {
      shifts = [];
    }

    let shiftsArray: string[] = [];
    if(shifts.length > 0){
      for(let shift of shifts){
        shiftsArray.push(shift.value);
      }
    }

    let exportPlan = { plan: employeeRows, week : yearWeek, times : shiftsArray }

    return JSON.stringify(exportPlan);
  }

  private createExportListData(localStorageKey: string): string {
    let data;
    if(JSON.parse(localStorage.getItem(localStorageKey))){
      data = JSON.parse(localStorage.getItem(localStorageKey));
    } else{
      data = [];
    }
    let returnData = "";
    for(let date of data){
      if(date instanceof Object){
        returnData += date.value + ",";
      }
      else {
        returnData += date + ",";
      }
    }
    return returnData.substring(0, returnData.length - 1);
  }

  importData(): void {

    try {
      this.showError = false;
      let input: string = this.inputData.toString();

      //A. Import plan
      if(this.data.elementType === ImpExElementType.Plan) {
        let parsedJSON = JSON.parse(input);
        this.importPlanData(parsedJSON);
      }
      else if(this.data.elementType === ImpExElementType.Employees) {
        this.importNames(input);
      }
      else if(this.data.elementType === ImpExElementType.Times) {
        this.importShifts(input)
      }


      this.dialogRef.close();
    } catch (e) {
      this.showError = true;
    }
  }

  importPlanData(parsedJSON: any): void {
    //1. load and validate the plan
    let plan : EmployeeRowInterface[] = parsedJSON.plan;
    let yearWeek : string = parsedJSON.week;
    let names : String[] = [];

    //2. load and validate the times
    let timesStringArray : String[] = parsedJSON.times;
    let times : ShiftInterface[] = [];
    if(timesStringArray)
    {
      for(let time of timesStringArray)
      {
        times.push(new Shift(time))
      }
      localStorage.setItem(TIMES_KEY_LS,JSON.stringify(times));
    }

    //3. load the names
    if(plan)
    {
      for(let employee of plan)
      {
        names.push(employee.name);
      }
      localStorage.setItem(yearWeek, JSON.stringify(plan));
      localStorage.setItem(NAMES_KEY_LS,JSON.stringify(names));
    }

    //5. Refresh the data for the frontend
    this.shiftTableService.initializePlan(Number(yearWeek.substring(5,7)));
  }

  importNames(names: string): void {
    names = names.replace(/\s/g, "");
    let namesArray = names.split(",");
    localStorage.setItem(NAMES_KEY_LS,JSON.stringify(namesArray));
    this.shiftTableService.refreshNames();
  }

  importShifts(shifts: string): void {
    shifts = shifts.replace(/\s/g, "");
    let shiftsArray = shifts.split(",");
    let shiftsObjects: Shift[] = [];
    for(let shift of shiftsArray){
      shiftsObjects.push(new Shift(shift));
    }
    localStorage.setItem(TIMES_KEY_LS,JSON.stringify(shiftsObjects));
    this.shiftTableService.loadShifts();
  }

  copyToClipboard() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.exportTextElement.nativeElement.innerText;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
