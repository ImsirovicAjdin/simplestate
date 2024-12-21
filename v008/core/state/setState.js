// setState.js
export const setState = (key, value, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        allowRoot
    } = options;

    // Only block root writes when we have a scope but no target specified
    if (target === document.documentElement && scope && !allowRoot) {
        return;
    }

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;

    target.style.setProperty(propertyName, JSON.stringify(value));
}