// getState.js
export const getState = (key, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        inherit = true,
        crossShadow = false
    } = options;

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;

    // Helper to get computed value
    const getComputedValue = (element) => {
        return getComputedStyle(element)
            .getPropertyValue(propertyName)
            .trim();
    };

    // Try to get value from target element
    let value = getComputedValue(target);
    
    // If no value found and inheritance is enabled, walk up DOM tree
    if (!value && inherit && target !== document.documentElement) {
        let currentElement = target;
        
        while (currentElement) {
            value = getComputedValue(currentElement);
            
            if (value) break;

            // Get parent, handling shadow DOM boundaries
            const root = currentElement.getRootNode();
            if (root instanceof ShadowRoot) {
                // If we're at a shadow root boundary
                if (crossShadow) {
                    // Cross into light DOM if allowed
                    currentElement = root.host;
                } else {
                    // Stop at shadow boundary if not allowed
                    break;
                }
            } else {
                // Normal DOM traversal
                currentElement = currentElement.parentElement;
            }

            // Stop if we've reached the root
            if (!currentElement || currentElement === document.documentElement) break;
        }
    }

    if (!value) return undefined;
    
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};
