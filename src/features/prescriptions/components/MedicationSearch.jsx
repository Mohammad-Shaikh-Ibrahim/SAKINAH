import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Chip } from '@mui/material';
import { useMedicationSearch } from '../hooks/usePrescriptions';
import ScienceIcon from '@mui/icons-material/Science';

export const MedicationSearch = ({ value, onSelect, error, helperText }) => {
    const [inputValue, setInputValue] = useState(value || '');

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const { data: searchResults = [], isLoading } = useMedicationSearch(inputValue);

    return (
        <Autocomplete
            fullWidth
            getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option ? `${option.brandName} (${option.genericName})` : '';
            }}
            filterOptions={(x) => x}
            options={searchResults}
            autoComplete
            includeInputInList
            filterSelectedOptions
            freeSolo
            forcePopupIcon={false}
            inputValue={inputValue}
            value={null}
            onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                    onSelect({
                        brandName: newValue,
                        genericName: newValue,
                        category: 'Custom',
                        commonForms: ['tablet'],
                        commonDosages: [''],
                        commonInstructions: ''
                    });
                    setInputValue(newValue);
                } else if (newValue && typeof newValue === 'object') {
                    onSelect(newValue);
                    setInputValue(newValue.brandName);
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onBlur={() => {
                // Capture typed text when user leaves field without selecting from dropdown
                if (inputValue && inputValue.trim()) {
                    onSelect({
                        brandName: inputValue.trim(),
                        genericName: inputValue.trim(),
                        category: 'Custom',
                        commonForms: ['tablet'],
                        commonDosages: [''],
                        commonInstructions: ''
                    });
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Medication (Brand or Generic)"
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <React.Fragment>
                                <ScienceIcon color="action" sx={{ mr: 1 }} />
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
                // Destructure key from props to avoid React key warning if necessary, 
                // but MUI usually handles it. We'll just pass props.
                return (
                    <li {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" fontWeight="bold">
                                {option.brandName}
                                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({option.genericName})
                                </Typography>
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip label={option.category} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                {option.commonForms && option.commonForms.slice(0, 2).map(form => (
                                    <Chip key={form} label={form} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(0,0,0,0.05)' }} />
                                ))}
                            </Box>
                        </Box>
                    </li>
                );
            }}
        />
    );
};
