import { setState } from './setState.js';
import { onChange } from './onChange.js';
import { updateCounterDisplay } from './ui.js';
import { createStyleTag } from './styleTag.js';
import { setupIncrement } from './increment.js';
import { setupDecrement } from './decrement.js';

const SimpleState = {
    init() {
        // Create our stylesheet
        this.sheet = createStyleTag();
        
        // Add initial state
        setState('count', 0);
        
        // Set up UI
        setupIncrement();
        setupDecrement();
            
        // Update UI when state changes
        onChange('count', updateCounterDisplay);
    }
};

// Initialize the state system
SimpleState.init();
