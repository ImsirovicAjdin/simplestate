import { watch } from '../state/watch.js';
import { getState } from '../state/getState.js';
import { setState } from '../state/setState.js';

export const computeState = (key, dependencies, compute, options = {}) => {
    const { scope, target } = options;
    const stateOptions = { scope, target };
    
    // Prevent multiple updates in the same tick
    let updateScheduled = false;
    
    const updateValue = () => {
        if (updateScheduled) return;
        updateScheduled = true;
        
        // Schedule update for next tick
        setTimeout(() => {
            // Get values using the same scope
            const values = dependencies.map(d => 
                getState(d, stateOptions)
            );
            setState(key, compute(...values), stateOptions);
            updateScheduled = false;
        }, 0);
    };

    // Update computed value whenever dependencies change
    const cleanups = dependencies.map(dep => 
        watch(dep, updateValue, stateOptions)
    );
    
    // Initial computation
    updateValue();
    
    // Return cleanup function that cleans up all watchers
    return () => cleanups.forEach(cleanup => cleanup());
};