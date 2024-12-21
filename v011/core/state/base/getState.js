// core/state/base/getState.js
import { cssProps } from '../utils/cssProps.js';

/**
 * Get state from a target element
 * @param {string} key - State key
 * @param {Object} options - Options
 * @param {HTMLElement} options.target - Target element (required)
 * @returns {*} State value
 */
export const getState = (key, options = {}) => {
    const { target } = options;
    
    if (!target) {
        throw new Error('Target element is required');
    }

    return cssProps.get(target, key);
};
