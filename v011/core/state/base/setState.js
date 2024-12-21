// core/state/base/setState.js
import { cssProps } from '../utils/cssProps.js';

/**
 * Set state on a target element
 * @param {string} key - State key
 * @param {*} value - State value
 * @param {Object} options - Options
 * @param {HTMLElement} options.target - Target element (required)
 */
export const setState = (key, value, options = {}) => {
    const { target } = options;
    
    if (!target) {
        throw new Error('Target element is required');
    }

    cssProps.set(target, key, value);
};