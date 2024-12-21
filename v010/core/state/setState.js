// setState.js
import { batchManager } from './batchManager.js';

export const setState = (key, value, options = {}) => {
    const { 
        prefix = '--state-',
        target = document.documentElement,
        scope,
        allowRoot,
        crossShadow = false,
        immediate = false  
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
    
    const serializedValue = JSON.stringify(value);

    if (immediate) {
        // Direct update for immediate mode
        target.style.setProperty(propertyName, serializedValue);
    } else {
        // Queue the update
        batchManager.queue(target, propertyName, serializedValue);
    }

    // If we're in a shadow root and crossShadow is enabled, also set on host
    if (isInShadow && crossShadow) {
        const host = root.host;
        if (host) {
            if (immediate) {
                host.style.setProperty(propertyName, serializedValue);
            } else {
                batchManager.queue(host, propertyName, serializedValue);
            }
        }
    }
}