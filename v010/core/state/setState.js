// setState.js
import { batchManager } from './batchManager.js';

export const setState = (key, value, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        immediate = false
    } = options;

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;
    
    const serializedValue = JSON.stringify(value);

    // Use batching but let CSS handle propagation
    if (immediate) {
        target.style.setProperty(propertyName, serializedValue);
    } else {
        batchManager.queue(target, propertyName, serializedValue);
    }
}