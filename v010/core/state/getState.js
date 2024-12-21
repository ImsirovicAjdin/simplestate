// getState.js
export const getState = (key, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope
    } = options;

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;

    // Let CSS handle inheritance - much simpler!
    const value = getComputedStyle(target)
        .getPropertyValue(propertyName)
        .trim();

    if (!value) return undefined;
    
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}
