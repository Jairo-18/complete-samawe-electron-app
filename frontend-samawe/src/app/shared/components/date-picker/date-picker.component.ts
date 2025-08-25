import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  @Input() label: string = 'Selecciona fecha y hora';
  @Input() parentForm!: FormGroup;
  @Input() controlName: string = 'datetime';
  @Output() valueChange = new EventEmitter<Date>();

  form: FormGroup = new FormGroup({
    day: new FormControl(1),
    month: new FormControl(1),
    year: new FormControl(new Date().getFullYear()),
    hour: new FormControl(0),
    minute: new FormControl(0)
  });

  years: number[] = [];
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);

  // Getters para evitar null y type assertions en el template
  get dayControl(): FormControl {
    return this.form.get('day') as FormControl;
  }
  get monthControl(): FormControl {
    return this.form.get('month') as FormControl;
  }
  get yearControl(): FormControl {
    return this.form.get('year') as FormControl;
  }
  get hourControl(): FormControl {
    return this.form.get('hour') as FormControl;
  }
  get minuteControl(): FormControl {
    return this.form.get('minute') as FormControl;
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i <= currentYear + 10; i++) this.years.push(i);

    this.form.valueChanges.subscribe((val) => {
      const date = new Date(
        val.year,
        val.month - 1,
        val.day,
        val.hour,
        val.minute
      );
      this.valueChange.emit(date);

      if (this.parentForm && this.controlName) {
        this.parentForm.get(this.controlName)?.setValue(date);
      }
    });
  }
}
