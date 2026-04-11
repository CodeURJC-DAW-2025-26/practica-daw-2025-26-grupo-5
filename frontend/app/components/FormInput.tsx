import { useFormContext, Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import type { ReactNode } from 'react';

interface FormInputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Generic Form Input Component for react-hook-form
 * Usage with useFormContext and Controller
 */
export default function FormInput({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  helpText,
  className = '',
}: FormInputProps) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name];

  return (
    <Form.Group className={`mb-3 ${className}`}>
      {label && (
        <Form.Label className="fw-700 mb-2">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Form.Control
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            isInvalid={!!error}
            className={error ? 'is-invalid' : ''}
            style={{
              borderRadius: '8px',
              borderColor: error ? '#dc3545' : '#e2e8f0',
              padding: '10px 12px',
              fontSize: '0.95rem',
            }}
          />
        )}
      />
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block mt-1 small">
          {error.message as string || `${label || 'Field'} is required`}
        </Form.Control.Feedback>
      )}
      {helpText && !error && (
        <Form.Text className="d-block mt-1 small text-muted">{helpText}</Form.Text>
      )}
    </Form.Group>
  );
}
