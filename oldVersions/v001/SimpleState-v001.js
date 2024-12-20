const SimpleState = {
    init() {
        // Create our stylesheet
        const style = document.createElement('style');
        document.head.appendChild(style);
        this.sheet = style.sheet;
        
        // Add initial state
        this.setState('count', 0);
        
        // Set up UI
        document.getElementById('increment')
            .addEventListener('click', () => {
                const count = this.getState('count');
                this.setState('count', count + 1);
            });
            
        document.getElementById('decrement')
            .addEventListener('click', () => {
                const count = this.getState('count');
                this.setState('count', count - 1);
            });
            
        // Update UI when state changes
        this.onChange('count', value => {
            document.getElementById('counter').textContent = value;
        });
    },
    
    // Store (save) state in CSS custom properties
    setState(key, value) {
        document.documentElement.style
            .setProperty(`--state-${key}`, JSON.stringify(value));
    },
    
    // Read state from CSS custom properties
    getState(key) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--state-${key}`);
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },
    
    // Watch for changes (built-in reactivity)
    onChange(key, callback) {
        const observer = new MutationObserver(() => {
            callback(this.getState(key));
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
};

// Initialize the state system
SimpleState.init();

