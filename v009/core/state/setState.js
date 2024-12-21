// setState.js
export const setState = (key, value, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        allowRoot,
        crossShadow = false
    } = options;

    // Get the root node (document or shadow root)
    const root = target.getRootNode();
    const isInShadow = root instanceof ShadowRoot;

    // Only block root writes when we have a scope but no target specified
    if (target === document.documentElement && scope && !allowRoot) {
        return;
    }

    // Include scope in the CSS custom property name
    const propertyName = scope 
        ? `${prefix}${scope}-${key}`
        : `${prefix}${key}`;

    // Set the property on the target
    target.style.setProperty(propertyName, JSON.stringify(value));

    // If we're in a shadow root and crossShadow is enabled, also set on host
    if (isInShadow && crossShadow) {
        const host = root.host;
        if (host) {
            host.style.setProperty(propertyName, JSON.stringify(value));
        }
    }
}