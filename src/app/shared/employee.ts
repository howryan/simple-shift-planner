export interface EmployeeRowInterface {
  name: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export class EmployeeRow implements EmployeeRowInterface{
  name;
  monday;
  tuesday;
  wednesday;
  thursday;
  friday;
  saturday;

  constructor(name: string, monday: string, tuesday: string, wednesday: string, thursday: string, friday: string, saturday: string){
    this.name = name;
    this.monday = monday;
    this.tuesday = tuesday;
    this.wednesday = wednesday;
    this.thursday = thursday;
    this.friday = friday;
    this.saturday = saturday;
  }
}
