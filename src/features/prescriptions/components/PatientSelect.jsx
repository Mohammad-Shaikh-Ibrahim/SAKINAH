import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Avatar } from '@mui/material';
import { usePatients } from '../../patients/api/usePatients';
import SearchIcon from '@mui/icons-material/Search';

export const PatientSelect = ({ onSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const { data: patientsData, isLoading } = usePatients({ search: inputValue });

    const patients = patientsData?.patients || [];

    return (
        <Autocomplete
            fullWidth
            options={patients}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.phone})`}
            filterOptions={(x) => x} // Server-side filtering primarily
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={null}
            onChange={(event, newValue) => {
                if (newValue) {
                    onSelect(newValue);
                    setInputValue('');
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Patient by Name or Phone"
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <React.Fragment>
                                <SearchIcon color="action" sx={{ mr: 1 }} />
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
            renderOption={(props, option) => {
                return (
                    <li {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#2D9596', fontSize: '0.875rem' }}>
                                {option.firstName?.charAt(0)}{option.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    {option.firstName} {option.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Phone: {option.phone} • DOB: {option.dob}
                                </Typography>
                            </Box>
                        </Box>
                    </li>
                );
            }}
        />
    );
};
