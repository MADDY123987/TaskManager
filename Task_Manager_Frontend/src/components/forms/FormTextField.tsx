import { TextField, type TextFieldProps } from '@mui/material';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

export function FormTextField<T extends FieldValues>({
  name,
  control,
  ...props
}: TextFieldProps & { name: Path<T>; control: Control<T> }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? props.helperText}
          fullWidth
          disabled={props.disabled ?? false}
        />
      )}
    />
  );
}
