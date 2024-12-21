// getState.js
export const getState = (key, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        inherit = true  
    } = options;

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;

    // Try to get value from target element
    let value = getComputedStyle(target)
        .getPropertyValue(propertyName)
        .trim();
    
    // If no value found and inheritance is enabled, walk up DOM tree
    // but only within same scope
    if (!value && inherit && target !== document.documentElement) {
        let currentElement = target.parentElement;
        while (currentElement) {
            value = getComputedStyle(currentElement)
                .getPropertyValue(propertyName)
                .trim();
            
            if (value || currentElement === document.documentElement) break;
            currentElement = currentElement.parentElement;
        }
    }

    if (!value) return undefined;
    
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};
