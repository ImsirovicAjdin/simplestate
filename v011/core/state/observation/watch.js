// core/state/observationwatch.js
import { getState } from "./base/getState.js";

export const watch = (key, callback, options = {}) => {
    const { 
        target = document.documentElement,
        scope
    } = options;

    const observer = new MutationObserver((mutations) => {
        // Only trigger if the mutation is for our target
        if (mutations.some(mutation => mutation.target === target)) {
            callback(getState(key, { target, scope }));
        }
    });
    
    observer.observe(target, {
        attributes: true,
        attributeFilter: ['style']
    });

    // Return cleanup function
    return () => observer.disconnect();
};
