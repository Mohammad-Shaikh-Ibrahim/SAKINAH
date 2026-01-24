import { format, isValid, parseISO } from 'date-fns';

export const formatDate = (date, pattern = 'MMM dd, yyyy') => {
    if (!date) return 'N/A';

    const parsed = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(parsed)) return 'Invalid Date';

    return format(parsed, pattern);
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm');
