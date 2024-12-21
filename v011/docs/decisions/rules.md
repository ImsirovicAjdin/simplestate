<!-- rules -->
# Rules

## 1. Unidirectional Flow
- All state flows down through DOM hierarchy
- No direct access to ancestor state without explicit inheritance
- Components can only modify their own state

## 2. State Update Mechanism
- State updates are made through CSS custom properties
- MutationObserver watches for state changes
- Changes automatically propagate through the DOM
- Browser handles batching and optimization

## 3. State Precedence
- Local state always overrides inherited state
- Exception: when explicitly marked as inheritable using a special flag/value
- Components must explicitly choose what to inherit

## 4. Conflict Resolution
- State conflicts are always resolved in favor of the most local state
- Unless that state explicitly defers to inherited state
- No special cases or configuration needed
- Components remain in control of their own state

## 5. State Atomicity and Scope
- State atomicity increases as you move down the tree
- State scope decreases as you move down the tree
- Higher levels handle app-wide concerns but are fewer in number
- Lower levels handle specific component state but are more numerous

## 6. Computed State
- Computed values are calculated where the source data lives
- Can be published for subscription by other components
- Updates automatically when dependencies change
- Uses same MutationObserver mechanism for updates

# Implementation

## Files to Remove
- `batchManager.js` - Browser handles batching natively
- `persistState.js` - Not core functionality, can be separate module

## Files to Add
- `inheritState.js` - For explicit inheritance control
- `subscribeToComputed.js` - For computed state subscription
- `validateScope.js` - For scope validation utilities

## File Modifications

### setState.js
- Remove batchManager dependency
- Remove immediate option
- Add validation that target is owned by caller
- Add handling of inheritance flags
- Add scope validation

### getState.js
- Add inheritance flag checking
- Enhance scope handling
- Add validation for scope naming conventions

### watch.js
- Make property watching more specific to state properties
- Add support for tracking computed values

### bindElement.js
- No changes needed (already follows rules)

### computeState.js
- Add publishing mechanism
- Add subscription support
- Enhance dependency tracking
- Add scope validation
- Support computed value inheritance

### SimpleState-v011.js
```javascript
export { setState } from './state/setState.js';
export { getState } from './state/getState.js';
export { watch } from './state/watch.js';
export { bindElement } from './binding/bindElement.js';
export { computeState } from './computed/computeState.js';
export { inheritState } from './state/inheritState.js';
export { subscribeToComputed } from './computed/subscribeToComputed.js';
```

## Key Implementation Details

### Inheritance Mechanism
```javascript
// Setting complex state
setState('userData', {
  value: {
    name: 'John',
    role: 'admin',
    preferences: { language: 'en' }
  },
  target: headerElement
});

// Different inheritance patterns
setState('userData.role', {
  value: 'inherit',
  from: 'root',  // Get from root state
  target: deepElement
});

setState('sortConfig', {
  value: 'inherit',
  from: 'nearest',  // Get from closest ancestor
  target: rowElement
});

setState('filterState', {
  value: 'inherit',
  from: 'filter-panel-123',  // Get from specific element
  target: resultElement
});
```

### Computed State
```javascript
// Computing totals in a data grid
computeState('gridStats', {
  dependencies: ['rows', 'selectedColumns'],
  compute: (rows, columns) => ({
    total: calculateTotal(rows, columns),
    average: calculateAverage(rows, columns),
    selected: columns.length
  }),
  publish: true
});

// Subscribing to grid stats
subscribeToComputed('gridStats', {
  onUpdate: (stats) => updateDashboard(stats)
});
```

### Scope Validation
```javascript
// Valid scope hierarchy
setState('gridData', { value: data, scope: 'data-grid' });
setState('rowData', { value: rowData, scope: 'data-grid.row', target: rowElement });
setState('cellData', { value: cellData, scope: 'data-grid.row.cell', target: cellElement });

// Invalid - child scope can't be broader than parent
setState('rowData', { value: data, scope: 'app', target: childElement });  // Error

// Invalid - skipping scope levels
setState('cellData', { value: data, scope: 'data-grid.cell', target: element });  // Error
```

## Edge Cases and Considerations

### Deep State Access
```javascript
// Problem: Dashboard needs data from deep within a data grid
<app-dashboard>
  <stats-display/> <!-- Needs computed grid totals -->
</app-dashboard>
<data-grid>
  <grid-row/>  <!-- Has the raw data -->
</data-grid>

// Solution: Publish computed values
computeState('gridMetrics', {
  dependencies: ['rows', 'columns'],
  compute: (rows, cols) => calculateMetrics(rows, cols),
  publish: true,
  scope: 'data-grid'
});
```

### State Composition
```javascript
// Problem: Component needs both local and inherited data
const tableState = {
  sorting: { column: 'id', direction: 'asc' },
  pagination: { page: 1, size: 20 }
};

// Solution: Mix local and inherited state
setState('tableConfig.sorting', {
  value: { column: 'id', direction: 'asc' },
  target: tableElement
});

setState('tableConfig.pagination', {
  value: 'inherit',
  from: 'nearest',
  target: tableElement
});
```

### Race Conditions
```javascript
// Problem: Multiple rapid data updates in a form
setState('formData.name', { value: 'J' });
setState('formData.name', { value: 'Jo' });
setState('formData.name', { value: 'John' });

// Solution: Browser's native batching
// All updates processed in next paint cycle
// No manual batching needed
```

### Shadow DOM Boundaries
```javascript
// Problem: Data grid needs parent's filter settings
<data-grid-container>
  #shadow-root
    <data-grid>
      #shadow-root
        <!-- Needs parent's filter config -->

// Solution: CSS custom properties cross shadow boundaries
setState('filterConfig', {
  value: { field: 'status', value: 'active' },
  target: gridContainer,
  crossShadow: true  // Explicitly allow crossing shadow boundaries
});

```

## State Serialization
```javascript
// Setting complex state object
setState('userData', {
  value: {
    name: 'John',
    role: 'admin',
    preferences: {
      theme: 'dark',
      fontSize: 14
    }
  },
  target: element
});

// Results in CSS custom properties:
// --state-userData-name: "John"
// --state-userData-role: "admin"
// --state-userData-preferences-theme: "dark"
// --state-userData-preferences-fontSize: "14"

// Accessing nested state
getState('userData.preferences.theme', { target: element });
// Returns: "dark"
```

## Cleanup and Lifecycle
```javascript
// 1. Computed State Cleanup
const statsComputed = computeState('gridStats', {
  dependencies: ['rows', 'selectedColumns'],
  compute: (rows, cols) => calculateStats(rows, cols),
  publish: true
});

// Cleanup when component unmounts
statsComputed.destroy();  // Removes all watchers and computed values

// 2. Subscription Cleanup
const subscription = subscribeToComputed('gridStats', {
  onUpdate: (stats) => updateDashboard(stats)
});

// Cleanup when no longer needed
subscription.unsubscribe();  // Removes subscription

// 3. Automatic Cleanup with bindElement
bindElement(element, {
  state: 'userData',
  callback: (data) => updateUI(data)
});
// Automatically cleaned up when element is removed from DOM
```

## Error Handling and Validation
```javascript
// 1. Scope Validation Errors
setState('gridData', {
  value: data,
  scope: 'invalid.*.scope'  // Error: Invalid scope pattern
  target: element
});
// Throws: "Invalid scope pattern. Must be dot-separated identifiers"

// 2. Target Ownership Errors
setState('protectedState', {
  value: data,
  target: nonOwnedElement
});
// Throws: "Target element must be owned by the caller"

// 3. Inheritance Errors
setState('userData', {
  value: 'inherit',
  from: 'nonexistent-id'  // Error: Source element not found
  target: element
});
// Throws: "Inheritance source element not found"

// 4. Computed Dependencies Errors
computeState('totalValue', {
  dependencies: ['nonexistentState'],  // Error: Dependency not found
  compute: (value) => calculate(value)
});
// Throws: "Computed state dependency 'nonexistentState' not found"

// 5. Type Validation
setState('count', {
  value: "not a number",
  type: 'number',  // Type validation
  target: element
});
// Throws: "Value must be a number"
```

