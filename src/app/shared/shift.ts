export interface ShiftInterface {
  value: String;
}

export class Shift implements ShiftInterface{
  value;

  constructor(value: String) {
    this.value = value;
  }
}
