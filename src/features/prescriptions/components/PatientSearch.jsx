import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { usePatients } from '../../patients/api/usePatients';

export const PatientSearch = ({ onSelect, error, helperText, disabled }) => {
    const [inputValue, setInputValue] = useState('');

    const { data, isLoading } = usePatients({ search: inputValue });
    const patients = data?.data || [];

    return (
        <Autocomplete
            fullWidth
            disabled={disabled}
            getOptionLabel={(option) => option ? `${option.firstName || ''} ${option.lastName || ''}`.trim() || 'Unnamed Patient' : ''}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            options={patients}
            loading={isLoading}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={null}
            noOptionsText={isLoading ? "Loading..." : (inputValue.length > 0 ? "No patients found" : "Type to search patients...")}
            onChange={(event, newValue) => {
                onSelect(newValue);
                if (newValue) {
                    setInputValue('');
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Patient (Name or Phone)"
                    error={error}
                    helperText={helperText || "Search by first name, last name or phone number"}
                    placeholder="Start typing to find a patient..."
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <React.Fragment>
                                <PersonIcon color="action" sx={{ mr: 1, ml: 1 }} />
                                {params.InputProps.startAdornment}
                            </React.Fragment>
                        ),
                        endAdornment: (
                            <React.Fragment>
                                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#2D9596', fontSize: '0.875rem' }}>
                            {String(option.firstName || '').charAt(0)}{String(option.lastName || '').charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight="bold">
                                {String(option.firstName || '')} {String(option.lastName || '')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {String(option.phone || 'No Phone')} • DOB: {String(option.dob || 'N/A')}
                            </Typography>
                        </Box>
                    </Box>
                </li>
            )}
        />
    );
};
