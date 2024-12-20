// bindElement.js
import { setState } from './setState.js';
import { getState } from './getState.js';
import { onChange } from './onChange.js';

export const bindElement = ({
    element,         // DOM element to bind
    stateKey,        // Key in state to bind to
    events = {},     // Event handlers that update state
    display         // Function to update UI when state changes
}) => {
    // Set up event listeners that update state
    Object.entries(events).forEach(([eventName, handler]) => {
        element.addEventListener(eventName, (e) => {
            const currentValue = getState(stateKey);
            const newValue = handler(e, currentValue);
            setState(stateKey, newValue);
        });
    });

    // Set up state observer that updates UI
    if (display) {
        onChange(stateKey, (value) => display(element, value));
    }
};