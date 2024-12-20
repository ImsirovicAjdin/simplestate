// bindElement.js
import { setState } from '../state/setState.js';
import { getState } from '../state/getState.js';
import { watch } from '../state/watch.js';

export const bindElement = ({
    element,         // DOM element to bind
    stateKey,        // Key in state to bind to
    events = {},     // Event handlers that update state
    display         // Function to update UI when state changes
}) => {
    // Track bound listeners for cleanup
    const boundListeners = new Map();

    // Set up event listeners that update state
    Object.entries(events).forEach(([eventName, handler]) => {
        const listener = (e) => {
            const currentValue = getState(stateKey);
            const newValue = handler(e, currentValue);
            setState(stateKey, newValue);
        };
        element.addEventListener(eventName, listener);
        boundListeners.set(eventName, listener);
    });

    // Set up state observer that updates UI
    let watchCleanup;
    if (display) {
        watchCleanup = watch(stateKey, (value) => display(element, value));
    }

    // Return cleanup function
    return () => {
        // Remove all event listeners
        boundListeners.forEach((listener, eventName) => {
            element.removeEventListener(eventName, listener);
        });
        boundListeners.clear();

        // Clean up state watch
        if (watchCleanup) {
            watchCleanup();
        }
    };
};