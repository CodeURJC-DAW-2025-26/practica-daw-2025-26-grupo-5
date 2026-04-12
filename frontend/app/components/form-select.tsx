import { useFormContext, Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * Generic Form Select Component for react-hook-form
 * Usage with useFormContext and Controller
 */
export default function FormSelect({
  name,
  label,
  placeholder = 'Select an option...',
  options,
  required = false,
  disabled = false,
  helpText,
  className = '',
}: FormSelectProps) {
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
          <Form.Select
            {...field}
            disabled={disabled}
            isInvalid={!!error}
            className={error ? 'is-invalid' : ''}
            style={{
              borderRadius: '8px',
              borderColor: error ? '#dc3545' : '#e2e8f0',
              padding: '10px 12px',
              fontSize: '0.95rem',
            }}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
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
