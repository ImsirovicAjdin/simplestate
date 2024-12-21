// core/persistence/persistState.js
import { watch } from '../state/watch.js';
import { setState } from '../state/setState.js';

export const persistState = (key, options = {}) => {
    const { enabled = true, scope, target } = options;
    const stateOptions = { scope, target };

    if (!enabled) return () => {};

    // Include scope in storage key if provided
    const storageKey = scope ? `state-${scope}-${key}` : `state-${key}`;

    // Initial load from storage
    const stored = localStorage.getItem(storageKey);
    if (stored) setState(key, JSON.parse(stored), stateOptions);
    
    // Watch for changes and return cleanup
    return watch(key, (value) => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, stateOptions);
};