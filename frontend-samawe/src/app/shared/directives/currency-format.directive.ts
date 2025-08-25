import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrencyFormat]',
  standalone: true
})
export class CurrencyFormatDirective {
  private lastValue = '';

  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const value = input.value;

    // Evitar procesamiento innecesario si el valor no cambió
    if (value === this.lastValue) return;

    // Obtener solo dígitos y comas
    const cleanValue = value.replace(/[^\d,]/g, '');

    // Manejar múltiples comas
    const commaCount = cleanValue.split(',').length - 1;
    let processedValue =
      commaCount > 1
        ? cleanValue.replace(/,/g, '').replace(/(\d+)(\d{2})$/, '$1,$2')
        : cleanValue;

    // Separar parte entera y decimal
    const [integerPart, decimalPart] = processedValue.split(',');

    // Formatear parte entera con separadores de miles
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Construir valor final
    let formattedValue = formattedInteger;
    if (decimalPart !== undefined) {
      formattedValue += `,${decimalPart.substring(0, 2)}`;
    }

    // Actualizar el valor en el input
    input.value = formattedValue;
    this.lastValue = formattedValue;

    // Calcular nueva posición del cursor
    const cursorOffset = formattedValue.length - value.length;
    const newCursorPosition = Math.max(0, cursorPosition + cursorOffset);
    input.setSelectionRange(newCursorPosition, newCursorPosition);

    // Actualizar el modelo con el valor numérico
    const numericValue = parseFloat(
      formattedValue.replace(/\./g, '').replace(',', '.')
    );
    this.control.control?.setValue(isNaN(numericValue) ? null : numericValue, {
      emitEvent: false,
      emitModelToViewChange: false
    });
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const value = this.control.value;

    if (value !== null && !isNaN(value)) {
      const [integer, decimal] = value.toFixed(2).split('.');
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      input.value = `${formattedInteger},${decimal}`;
      this.lastValue = input.value;
    }
  }
}
