import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {EmployeeRow, EmployeeRowInterface} from './employee';
import {Shift} from "./shift";
import {ShifttableComponent} from "../shifttable/shifttable.component";

// Only german NRW public holiday days: TODO: Import & Export functionality
const PUBLIC_HOLIDAY_DAYS: string[] = [
  '01.01.2019', '19.04.2019', '22.04.2019', '01.05.2019', '30.05.2019', '10.06.2019', '20.06.2019', '03.10.2019', '01.11.2019', '25.12.2019', '26.12.2019', '01.01.2020', '10.04.2020', '13.04.2020',
  '01.05.2020', '21.05.2020', '01.06.2020', '11.06.2020', '03.10.2020', '01.11.2020', '25.12.2020', '26.12.2020', '01.01.2021', '06.01.2021', '08.03.2021', '02.04.2021', '04.04.2021', '05.04.2021',
  '01.05.2021', '13.05.2021', '23.05.2021', '24.05.2021', '03.06.2021', '15.08.2021', '20.09.2021', '03.10.2021', '31.10.2021', '01.11.2021', '17.11.2021', '25.12.2021', '26.12.2021'
];

const COLUMN_TITLES: EmployeeRowInterface = {name: 'Name', monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag'};

export const TIMES_KEY_LS = "times";
export const NAMES_KEY_LS = "names";

const EMPLOYEE_DATA_ROWS: EmployeeRow[] = [];
const SHIFTS_DATA: Shift[] = [];

@Injectable()
export class ShiftTableService {
  emptyShift: Shift;
  shiftTableComponent: ShifttableComponent;
  selectedWeekNumber: number;


  constructor() {
    this.emptyShift = { value : ''};
    this.selectedWeekNumber = Number(new DatePipe('en-US').transform(new Date(), 'w'));
  }

  initializePlan(weekNumber: number) {
    //Initialize Shifts
    this.loadShifts();

    //Initialize Employee Data Rows
    this.loadEmployeeWithDays(weekNumber);

    this.shiftTableComponent.loadWeekData(weekNumber);
  }

  // Returns the plan, which is the EmployeesWithDays + additional Names which are in the localStorage
  private getEmployeeWithDays(weekNumber: number): EmployeeRow[] {
    if (localStorage.getItem(new Date().getFullYear() + "-" + weekNumber.toString())) {
      let parsedWeek: EmployeeRow[] = JSON.parse(localStorage.getItem(new Date().getFullYear() + "-" + weekNumber.toString()));
      return parsedWeek;
    }
    else {
      return this.createEmptyWeek();
    }
  }

  private loadEmployeeWithDays(weekNumber: number): void {
    while(EMPLOYEE_DATA_ROWS.length) {
      EMPLOYEE_DATA_ROWS.pop();
    }
    for(let employeeRow of this.getEmployeeWithDays(weekNumber)){
      EMPLOYEE_DATA_ROWS.push(employeeRow);
    }
  }

  refreshNames(): void {
    let newEmployeeRows: EmployeeRow[] = [];

    //1. Get all names which are currently displayed
    let currentNames: string[] = [];
    for (let employeeRow of EMPLOYEE_DATA_ROWS) {
      currentNames.push(employeeRow.name);
    }

    //2. Load all names which are stored
    let storedNames: string[] = JSON.parse(localStorage.getItem(NAMES_KEY_LS));

    //3 Identify all names which should be deleted
    let deleteEmployees: string[] = [];
    for (let currentName of currentNames) {
      if (!storedNames.includes(currentName)) {
        deleteEmployees.push(currentName);
      }
    }

    //4 Only apply names which are stored to the new employee rows, which deletes the old ones
    for (let employeeRow of EMPLOYEE_DATA_ROWS) {
      if(!deleteEmployees.includes(employeeRow.name)){
        newEmployeeRows.push(employeeRow);
      }
    }

    //5.1 Identify all names which should be newly created
    let createEmployees: string[] = [];
    for(let storedName of storedNames){
      if(!currentNames.includes(storedName)){
        createEmployees.push(storedName);
      }
    }

    //5.2 Create all new employees
    for(let createEmployee of createEmployees){
      newEmployeeRows.push(new EmployeeRow(createEmployee,'','','','','',''));
    }

    //6. Refresh the employee data
    while (EMPLOYEE_DATA_ROWS.length){
      EMPLOYEE_DATA_ROWS.pop();
    }
    for(let newEmployeeRow of newEmployeeRows){
      let clonedEmployee = new EmployeeRow(newEmployeeRow.name, newEmployeeRow.monday, newEmployeeRow.tuesday, newEmployeeRow.wednesday, newEmployeeRow.thursday, newEmployeeRow.friday, newEmployeeRow.saturday);
      EMPLOYEE_DATA_ROWS.push(clonedEmployee);
    }

    console.log(EMPLOYEE_DATA_ROWS);
  }

  refreshNamesAfterNameImport(): void {
    this.refreshNames();
    this.shiftTableComponent.loadEmployeeKeys();
    this.shiftTableComponent.storeCurrentWeek();
  }


  private createEmptyWeek(): EmployeeRow[]{
    if(localStorage.getItem(NAMES_KEY_LS))
    {
      let tmpNames : string[] = JSON.parse(localStorage.getItem(NAMES_KEY_LS));
      let tmpEmployeeRows : EmployeeRow[] = [];
      for(let name of tmpNames)
      {
        tmpEmployeeRows.push(new EmployeeRow(name,'','','','','',''));
      }
      return tmpEmployeeRows;
    }
    else {
      return [];
    }
  }

  getColumnTitles() {
    return COLUMN_TITLES;
  }
  getEmployeeDataRows(){
    return EMPLOYEE_DATA_ROWS;
  }
  getShifts(){
    return SHIFTS_DATA;
  }

  // Returns the available shifts, e.g. 08:00-16:00, Urlaub or an empty string
  getAvailableShifts(): Shift[] {
    let storedTimes = localStorage.getItem(TIMES_KEY_LS);
    if (storedTimes) {
      let loadedTimes : Shift[] = JSON.parse(storedTimes);
      return loadedTimes;
    }

    return [this.emptyShift];
  }

  loadShifts(): void {
    while (SHIFTS_DATA.length) {
      SHIFTS_DATA.pop();
    }
    SHIFTS_DATA.push(this.emptyShift);
    for(let shift of this.getAvailableShifts()){
      SHIFTS_DATA.push(shift);
    }
  }

  // Returns the index of all public holidays of specific week
  getPublicHolidayIndex(daysOfWeek: Date[]): number[] {
    const publicHolidayIndex: number[] = [];

    let index = 1;

    // check if the days of the week are public holiday days
    for (const dayOfWeek of daysOfWeek) {
      const formattedDayOfWeek: string = new DatePipe('en-US').transform(dayOfWeek, 'dd.MM.yyyy');
      for (const publicHolidayDay of PUBLIC_HOLIDAY_DAYS) {
        if (formattedDayOfWeek === publicHolidayDay) {
          publicHolidayIndex.push(index);
        }
      }
      index++;
    }
    return publicHolidayIndex;
  }

  getDaysOfWeek(weeknumber: number): Date[] {
    // conversion due to possible string parameter
    weeknumber = Number(weeknumber);

    const weekDays: Array<Date> = [];

    // transform the todays date into a weeknumber
    const today: Date = new Date();
    let currentWeekString: string = new DatePipe('en-US').transform(today, 'w');
    let currentWeekNumber: number = Number(currentWeekString);

    // iterate until the requested week is reached
    while (currentWeekNumber !== weeknumber) {
      today.setDate(today.getDate() + 6);
      currentWeekString = new DatePipe('en-US').transform(today, 'w');
      currentWeekNumber = Number(currentWeekString);
    }

    // get the monday of the week
    if (today.getDay() === 0) {
      today.setDate(today.getDate() + 1);
    } else if (today.getDay() > 1) {
      while (today.getDay() !== 1) {
        today.setDate(today.getDate() - 1);
      }
    }

    // push new dates into the array. All days of the week starting with monday
    while (today.getDay() !== 0) {
      weekDays.push(new Date(today.getTime()));
      today.setDate(today.getDate() + 1);
    }

    return weekDays;
  }

  // take the current weeknumber, iterate until week 52 and start again with 1
  getFutureWeekNumbers(): number[] {
    const today: Date = new Date();
    const currentWeekString: string = new DatePipe('en-US').transform(today, 'w');
    let currentWeekNumber: number = Number(currentWeekString);

    const weeknumbers: Array<number> = [];

    for (let i = 0; i <= 20; i++) {
      if (currentWeekNumber === 53) {
        currentWeekNumber = 1;
      }
      weeknumbers.push(currentWeekNumber++);
    }

    return weeknumbers;
  }

  resetShiftData(employeeEntries: EmployeeRow[]) {
    const employeeKeys = Object.keys(employeeEntries[0]);
    employeeKeys.shift();

    let row: EmployeeRow;
    for (row of employeeEntries) {
      for (const day of employeeKeys) {
        row[day] = '';
      }
    }
  }

  getSelectedWeekNumber(): number {
    return this.shiftTableComponent.getSelectedWeekNumber();
  }

  registerShiftTableComponent(shiftTableComponent: ShifttableComponent) {
    this.shiftTableComponent = shiftTableComponent;
  }

  loadStatisticalBottomData(): any {
    let statisticalDataObject = this.resetStatisticalBottomData();

    let employeeDataRows = this.getEmployeeDataRows();

    //Load the data from the actual plan into the statistical data rows
    for(let employeeDataRow of employeeDataRows){
      for(let weekDayName of  Object.keys(statisticalDataObject)){
        //Check if the employee has a time or a status (e.g. vacation) for the day
        if(employeeDataRow[weekDayName]){
          //Check if the time or status already exist for the day and iterate - otherwise create with value 1
          if(!statisticalDataObject[weekDayName][employeeDataRow[weekDayName]]){
            statisticalDataObject[weekDayName][employeeDataRow[weekDayName]] = 1;
          } else {
            statisticalDataObject[weekDayName][employeeDataRow[weekDayName]] += 1;
          }
        }
      }
    }
    return statisticalDataObject;
  }

  resetStatisticalBottomData(): any {
    let statisticalDataObject = {};
    const columnKeys = Object.keys(this.getColumnTitles());
    //Initialize statistical data object
    for(let columnKey of columnKeys){
      //Just take the weekdays not the name-column
      if(columnKey != columnKeys[0]){
        statisticalDataObject[columnKey] = {}
      }
    }
    return statisticalDataObject;
  }

}
