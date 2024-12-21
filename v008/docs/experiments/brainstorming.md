<!-- ./docs/experiments/brainstorming.md -->

# State Management with CSS Features

## Key CSS Capabilities

Our state management system leverages several CSS features:

* CSS custom properties naturally cascade and inherit
* They can be scoped to any element in the DOM tree
* They can be dynamically updated without triggering reflows

## Example Patterns

```javascript
// Parent component state
setState('theme', 'dark', { scope: 'app', target: appContainer });

// Child inherits parent state but can override
setState('theme', 'light', { scope: 'widget', target: widgetContainer });

// Grandchild inherits unless overridden
getState('theme', { target: childElement }); // Gets closest defined theme
```

## Computed Inheritance

We could implement "computed inheritance" where child states automatically updated based on parent state changes, similar to how CSS calc() works with custom properties. This would be a way to "inherit" state from a parent element to a child element.

Potential powerful use cases:
* Theme inheritance with local overrides
* Permission/capability propagation
* Configuration cascading
* Component state composition

## Unexplored Synergies

### CSS Custom Properties + Media Queries
```css
@media (prefers-color-scheme: dark) {
    :root {
        --state-theme: 'dark';
    }
}
```
- Automatic state changes based on media queries
- Responsive state management
- System preference integration

### CSS Custom Properties + Container Queries
```css
@container sidebar (max-width: 200px) {
    .widget {
        --state-layout: 'compact';
    }
}
```
- Container-aware state
- Automatic layout state management
- Component-level responsiveness

### CSS Custom Properties + CSS Nesting
```css
.app {
    --state-theme: 'light';
    
    &[data-mode="dark"] {
        --state-theme: 'dark';
        
        & .widget {
            --state-contrast: 'high';
        }
    }
}
```
- Nested state relationships
- Cascading state rules
- State inheritance patterns

### CSS Custom Properties + CSS @layer
```css
@layer base {
    :root {
        --state-theme: 'light';
    }
}

@layer theme {
    :root {
        --state-theme: 'dark';
    }
}
```
- State priority management
- Cascading layer control
- Plugin system architecture

Each of these combinations opens up new possibilities while maintaining the core principle: leveraging native browser features rather than fighting against them.

## An idea for a later release

Implement a proof-of-concept for the media query integration. We can create a new module called mediaState.js that automatically syncs state with media queries.