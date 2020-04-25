// Library for storing and editing data

import { open, writeFile, close, readFile, ftruncate, unlink } from 'fs';
import { join } from 'path';
import { parseJsonToObject } from './helpers';

// Base directory of the data folder
const baseDir = join(__dirname, '/../.data/');

export const create = (dir, file, data, callback) => {
    open(`${baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file
            writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
export const read = (dir, file, callback) => {
    readFile(`${baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// Update data inside a file
export const update = (dir, file, data, callback) => {
    open(`${baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Write to file
            ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write to file
                    writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');
                                }
                            });
                        } else {
                            callback('Error writing to file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open file for updating, it may not exist');
        }
    });
};

// Delete a file
export const deleteFile = (dir, file, callback) => {
    unlink(`${baseDir}${dir}/${file}.json`, (err) => {
        if (!err) callback(false);
        else callback('Error deleting file');
    });
};
