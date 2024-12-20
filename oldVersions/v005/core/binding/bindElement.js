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
    // Store cleanup functions
    const cleanupFunctions = [];

    // Set up event listeners that update state
    Object.entries(events).forEach(([eventName, handler]) => {
        const listener = (e) => {
            const currentValue = getState(stateKey);
            const newValue = handler(e, currentValue);
            setState(stateKey, newValue);
        };
        element.addEventListener(eventName, listener);
        cleanupFunctions.push(() => element.removeEventListener(eventName, listener));
    });

    // Set up state observer that updates UI
    if (display) {
        const cleanup = watch(stateKey, (value) => display(element, value));
        cleanupFunctions.push(cleanup);
    }

    // Return a single cleanup function that handles all cleanups
    return () => cleanupFunctions.forEach(cleanup => cleanup());
};