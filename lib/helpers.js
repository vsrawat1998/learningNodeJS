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

// Create a string of random alphanumeric characters, of a given length

export const createRandomString = (strLength) => {
    strLength =
        typeof strLength == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let str = '';
        for (let index = 0; index < strLength; index++) {
            let randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );

            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
};
