import type { ReactNode } from 'react';

type FormFieldProps = {
  htmlFor: string;
  label: string;
  error?: string;
  children: ReactNode;
};

const FormField = ({ htmlFor, label, error, children }: FormFieldProps) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default FormField;
