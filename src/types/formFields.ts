// Types for PDF form fields

export type FormFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'multiline';

export interface FormFieldBase {
  id: string;
  type: FormFieldType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: string;
}

export interface TextFormField extends FormFieldBase {
  type: 'text';
  maxLength?: number;
  placeholder?: string;
  fontSize?: number;
}

export interface MultilineFormField extends FormFieldBase {
  type: 'multiline';
  maxLength?: number;
  placeholder?: string;
  fontSize?: number;
  rows?: number;
}

export interface CheckboxFormField extends FormFieldBase {
  type: 'checkbox';
  checked?: boolean;
}

export interface RadioFormField extends FormFieldBase {
  type: 'radio';
  group: string;
  value: string;
  selected?: boolean;
}

export interface DropdownFormField extends FormFieldBase {
  type: 'dropdown';
  options: string[];
  selectedIndex?: number;
  multiSelect?: boolean;
}

export type FormField = TextFormField | MultilineFormField | CheckboxFormField | RadioFormField | DropdownFormField;

export interface FormFieldOptions {
  fields: FormField[];
  onProgress?: (progress: number, message: string) => void;
}
