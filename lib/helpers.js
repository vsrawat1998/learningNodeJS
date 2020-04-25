// Helpers for various tasks

import { createHmac } from 'crypto';
import { hashingSecret } from './config';

export const hash = (str) => {
    if (typeof str == 'string' && str.length > 0) {
        const hash = createHmac('sha256', hashingSecret)
            .update(str)
            .digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse JSON string to object in all cases, without throwing error
export const parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        console.log(e);
        return {};
    }
};
