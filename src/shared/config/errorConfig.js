
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import BlockIcon from '@mui/icons-material/Block';

export const errorConfig = {
    404: {
        code: '404',
        title: 'Page Not Found',
        message: "The page you are looking for doesn't exist or has been moved.",
        icon: SentimentDissatisfiedIcon,
    },
    401: {
        code: '401',
        title: 'Unauthorized',
        message: 'You need to log in to access this resource.',
        icon: LockIcon,
    },
    403: {
        code: '403',
        title: 'Forbidden',
        message: "You don't have permission to view this page.",
        icon: BlockIcon,
    },
    500: {
        code: '500',
        title: 'Internal Server Error',
        message: 'Something went wrong on our side. Please try again later.',
        icon: ErrorOutlineIcon,
        isServer: true,
    },
    502: {
        code: '502',
        title: 'Bad Gateway',
        message: 'We received an invalid response from the server.',
        icon: CloudOffIcon,
        isServer: true,
    },
    503: {
        code: '503',
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. We are working on it.',
        icon: CloudOffIcon,
        isServer: true,
    },
    default: {
        code: 'Error',
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred.',
        icon: ErrorOutlineIcon,
    },
};
