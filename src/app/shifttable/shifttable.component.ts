import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import {ShiftTableService} from '../shared/shifttable.service';
import { EmployeeRow } from '../shared/employee';
import {Shift} from "../shared/shift";
import html2canvas from "html2canvas";

@Component({
  selector: 'app-shifttable',
  templateUrl: './shifttable.component.html',
  styleUrls: ['./shifttable.component.css']
})
export class ShifttableComponent implements OnInit {

  @Input() sidenav;

  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;

  displayedColumns: EmployeeRow;
  shifts: Shift[];
  employeeShiftRows: EmployeeRow[];
  employeeKeys: string[];
  weekNumbers: number[];
  selectedWeekNumber: number;
  daysOfWeek: Date[];
  holidayDaysIndex: number[];
  sortAsc: Boolean;
  expandImportFileSection: Boolean;

  statisticalBottomData: any;

  constructor(private shiftTableService: ShiftTableService) {
    shiftTableService.registerShiftTableComponent(this);
  }

  ngOnInit() {
    this.displayedColumns = this.shiftTableService.getColumnTitles();
    this.shifts = this.shiftTableService.getShifts();
    this.employeeShiftRows = this.shiftTableService.getEmployeeDataRows();

    this.selectedWeekNumber = Number(new DatePipe('en-US').transform(new Date(), 'w'));
    this.shiftTableService.initializePlan(this.selectedWeekNumber);
    this.weekNumbers = this.shiftTableService.getFutureWeekNumbers();

    this.sortAsc = true;
    this.expandImportFileSection = false;
  }

  public loadWeekData(selectedWeekNumber: number) {
    this.selectedWeekNumber = selectedWeekNumber;
    this.daysOfWeek = this.shiftTableService.getDaysOfWeek(this.selectedWeekNumber);
    this.holidayDaysIndex = this.shiftTableService.getPublicHolidayIndex(this.daysOfWeek);
    this.resetStatisticalBottomData();
    this.loadEmployeeKeys();
    this.loadStatisticalBottomData();
  }

  loadEmployeeKeys(){
    if(this.employeeShiftRows[0]){
      this.employeeKeys = Object.keys(this.employeeShiftRows[0]);
    }
  }

  isPublicHoliday(index: number): boolean {
    if (this.holidayDaysIndex.length === 0) {
      return false;
    } else if (this.holidayDaysIndex.includes(index)) {
      return true;
    } else {
      return false;
    }
  }

  // sort by keys (name & weekdays) and move empty cells to last position
  sortColumns(key, sortAsc) {
    this.employeeShiftRows.sort(function(a, b) {
      const x = a[key]; const y = b[key];
      if (x === '' || x === null) { return 1; }
      if (y === '' || y === null) { return -1; }
      if (x < y) { return sortAsc ? -1 : 1; }
      if (x > y) { return sortAsc ? 1 : -1; }
      return 0;
    });

    this.sortAsc = !this.sortAsc;

    this.storeCurrentWeek();
  }

  getColumnKeys(): Array<string> {
    return Object.keys(this.displayedColumns);
  }

  storeCurrentWeek() {
    localStorage.setItem(new Date().getFullYear() + "-" + this.selectedWeekNumber.toString(), JSON.stringify(this.employeeShiftRows));
    this.loadStatisticalBottomData();
  }

  refreshNames(){
    this.shiftTableService.refreshNamesAfterNameImport();
  }

  getSelectedWeekNumber(): number {
    return this.selectedWeekNumber;
  }

  initializePlan(event): void {
    this.shiftTableService.initializePlan(event);
  }

  resetStatisticalBottomData(): void {
    this.statisticalBottomData = this.shiftTableService.resetStatisticalBottomData();
  }

  getStatisticalBottomDataKeys(weekday: string): Array<string> {
    return Object.keys(this.statisticalBottomData[weekday]).sort((one, two) => (one < two ? -1 : 1));
  }

  loadStatisticalBottomData() {
    this.statisticalBottomData = this.shiftTableService.loadStatisticalBottomData();
  }

  //Not used
  resetShiftData() {
    this.shiftTableService.resetShiftData(this.employeeShiftRows);
  }

  //Not used
  downloadEmployeeShiftWeek() {
    const element = document.getElementById('shiftDownload');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.employeeShiftRows)));
    element.setAttribute('download', 'Schichtplan_KW' + this.selectedWeekNumber.toString() + '.json' );
    element.click();
  }

  //Not used
  importEmployeeShiftWeekFile() {
    this.expandImportFileSection = !this.expandImportFileSection;
  }

  takeScreenShot(){
    let html2canvasOptions = {
      windowWidth: 1300,
      windowHeight: 970
    };

    html2canvas(document.body, html2canvasOptions).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = 'marble-diagram.png';
      this.downloadLink.nativeElement.click();
    });
  }
}
