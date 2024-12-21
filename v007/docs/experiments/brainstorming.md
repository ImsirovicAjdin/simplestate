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

