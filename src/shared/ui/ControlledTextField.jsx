import React from 'react';
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';

export const ControlledTextField = ({
    name,
    control,
    rules,
    defaultValue = '',
    ...textFieldProps
}) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    {...textFieldProps}
                    error={!!error}
                    helperText={error ? error.message : textFieldProps.helperText}
                />
            )}
        />
    );
};
