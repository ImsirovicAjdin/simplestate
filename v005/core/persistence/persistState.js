// core/persistence/persistState.js
import { watch } from '../state/watch.js';
import { getState } from '../state/getState.js';
import { setState } from '../state/setState.js';

export const persistState = (key, options = {}) => {
    const { enabled = true } = options;

    if (!enabled) return () => {};

    // Initial load from storage
    const stored = localStorage.getItem(`state-${key}`);
    if (stored) setState(key, JSON.parse(stored));
    
    // Watch for changes and return cleanup
    return watch(key, (value) => {
        localStorage.setItem(`state-${key}`, JSON.stringify(value));
    });
};