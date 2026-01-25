import React, { useState } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Chip } from '@mui/material';
import { useMedicationSearch } from '../hooks/usePrescriptions';
import ScienceIcon from '@mui/icons-material/Science';

export const MedicationSearch = ({ onSelect, error, helperText }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    const { data: searchResults = [], isLoading } = useMedicationSearch(inputValue);

    return (
        <Autocomplete
            fullWidth
            getOptionLabel={(option) => `${option.brandName} (${option.genericName})`}
            filterOptions={(x) => x} // Disable client-side filtering as we rely on hook results
            options={searchResults}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={null}
            noOptionsText="Type to search medications..."
            onChange={(event, newValue) => {
                if (newValue) {
                    onSelect(newValue);
                    setInputValue(''); // Reset after selection to clear search
                }
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Medication (Brand or Generic)"
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
