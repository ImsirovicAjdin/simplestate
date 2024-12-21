// core/state/utils/cssProps.js

/**
 * Prefix for all state CSS custom properties
 */
export const CSS_PREFIX = '--state-';

/**
 * Utilities for working with CSS custom properties as state
 */
export const cssProps = {
    /**
     * Convert state key to CSS property name
     * @param {string} key - State key
     * @returns {string} CSS property name
     */
    toPropertyName: (key) => {
        if (!key || typeof key !== 'string') {
            throw new Error('State key must be a non-empty string');
        }
        return `${CSS_PREFIX}${key}`;
    },

    /**
     * Convert CSS property name back to state key
     * @param {string} propertyName - CSS property name
     * @returns {string} State key
     */
    toStateKey: (propertyName) => {
        if (!propertyName?.startsWith(CSS_PREFIX)) {
            throw new Error('Not a state CSS property');
        }
        return propertyName.slice(CSS_PREFIX.length);
    },

    /**
     * Set CSS property on element
     * @param {HTMLElement} element - Target element
     * @param {string} key - State key
     * @param {*} value - Value to set
     */
    set: (element, key, value) => {
        if (!(element instanceof Element)) {
            throw new Error('Target must be a DOM element');
        }
        
        // Convert value to string, handling objects and arrays
        const stringValue = typeof value === 'object' 
            ? JSON.stringify(value)
            : String(value);

        element.style.setProperty(cssProps.toPropertyName(key), stringValue);
    },

    /**
     * Get CSS property from element
     * @param {HTMLElement} element - Target element
     * @param {string} key - State key
     * @returns {string} Property value
     */
    get: (element, key) => {
        if (!(element instanceof Element)) {
            throw new Error('Target must be a DOM element');
        }

        const value = getComputedStyle(element)
            .getPropertyValue(cssProps.toPropertyName(key))
            .trim();

        // Try parsing as JSON if it looks like an object or array
        if (value.startsWith('{') || value.startsWith('[')) {
            try {
                return JSON.parse(value);
            } catch {
                // If parsing fails, return as is
                return value;
            }
        }

        return value;
    },

    /**
     * Check if property name is a state property
     * @param {string} propertyName - CSS property name
     * @returns {boolean} True if property is a state property
     */
    isStateProperty: (propertyName) => {
        return propertyName?.startsWith(CSS_PREFIX) ?? false;
    },

    /**
     * Remove state property from element
     * @param {HTMLElement} element - Target element
     * @param {string} key - State key
     */
    remove: (element, key) => {
        if (!(element instanceof Element)) {
            throw new Error('Target must be a DOM element');
        }
        element.style.removeProperty(cssProps.toPropertyName(key));
    }
};