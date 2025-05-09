# Cloudflare Worker Example of SSE, Datastar and Mustache.

A Cloudflare Worker implementation of Server-Sent Events (SSE) with dynamic content updates and repeating events. This project implements Datastar's SSE protocol using Mustache for templating and a minimal Cloudflare router library. It provides a lightweight, efficient way to handle real-time updates in a Cloudflare Workers environment.

> **Note:** This project is currently experimental and serves as a Proof of Concept (POC). It may not be suitable for production use and is subject to change. Use it at your own risk.

## Features

- Server-Sent Events (SSE) implementation
- Dynamic content updates using fragments
- Repeating events with customizable intervals
- Support for both static and dynamic content
- HTML fragment merging with selectors
- Signal updates for client-side state management
- Script execution with customizable attributes
- Fragment and signal removal capabilities
- Automatic HTML minification
- Built-in CORS support

## Dependencies

### Core Libraries
- `@tsndr/cloudflare-worker-router`: Lightweight router for Cloudflare Workers with TypeScript support
- `mustache`: Logic-less templating engine for rendering HTML templates
- `@cloudflare/workers-types`: TypeScript definitions for Cloudflare Workers

### Custom Utilities
- `mergeFragments`: Utility for merging HTML fragments with client-side DOM
- `mergeSignals`: Utility for managing client-side state updates
- `removeFragments`: Utility for removing HTML elements from the DOM
- `removeSignals`: Utility for removing signals from client-side state
- `executeScript`: Utility for executing JavaScript code on the client side
- `repeatingEvent`: Helper for creating repeating SSE events
- `createSSEResponse`: Utility for creating Server-Sent Events responses

## SSE Protocol

Our implementation uses a custom SSE protocol format for each event type:

### Merge Fragments
```
event: datastar-merge-fragments
data: fragments <minified-html>
data: selector <css-selector>
data: mergeMode <mode>
data: useViewTransition <boolean>
```

### Merge Signals
```
event: datastar-merge-signals
data: signals <json-string>
data: onlyIfMissing <boolean>
```

### Remove Fragments
```
event: datastar-remove-fragments
data: selector <css-selector>
```

### Remove Signals
```
event: datastar-remove-signals
data: paths <path1>
data: paths <path2>
```

### Execute Script
```
event: datastar-execute-script
data: autoRemove <boolean>
data: attributes <name> <value>
data: script <javascript-code>
```

## Implementation Details

### HTML Minification
All HTML fragments are automatically minified before being sent to the client. This reduces bandwidth usage and improves performance. The minification process:
- Removes unnecessary whitespace
- Preserves essential whitespace in text content
- Maintains HTML structure and functionality

### CORS Support
The router includes built-in CORS support, allowing cross-origin requests. This is essential for:
- Development environments
- Cross-domain API access
- Integration with different frontend applications

### Custom Event Types
While we provide factory functions for common event types, you can create custom events by implementing the `Event` interface:

```typescript
interface Event {
  type: string;
  format(): string;
  _repeating?: {
    frequency: number;
    originalEvent: Event | null;
  };
}
```

The `/heartbeat` endpoint demonstrates this with a custom event that:
- Uses `type: null` for a comment event
- Implements a custom `format()` method
- Includes repeating functionality

## Fragment Types

The `fragment` property in `mergeFragments` can be either:
- A string: For static content that doesn't change (evaluated once when the event is created)
- A function: For dynamic content that needs to be re-evaluated (called each time the event is sent)

```typescript
// Static content - evaluated once
fragment: '<div>Static content</div>'

// Dynamic content - re-evaluated each time
fragment: () => `<div>${new Date().toLocaleTimeString()}</div>`
```

Important notes about dynamic fragments:
1. The function is called each time the event is sent
2. Use for content that needs to be fresh (clocks, counters, real-time data)
3. Can be combined with repeating events for periodic updates
4. The function should be pure and fast, as it may be called frequently

## Available Endpoints

### /merge-fragments
Updates HTML content with static content.
```typescript
const event = mergeFragments({
  fragment: '<div>Static content</div>',
  selector: '#listing'
});
```

### /merge-fragments-repeating
Updates HTML content with dynamic content that changes every second.
```typescript
const event = mergeFragments({
  fragment: () => `<div id="clock">${new Date().toLocaleTimeString()}</div>`,
  selector: '#clock'
});
const repeatEvent = repeatingEvent(event, 1000);
```

### /merge-signals
Updates client-side state.
```typescript
const event = mergeSignals({
  signals: {
    foo: 'merged'
  }
});
```

### /remove-fragments
Removes HTML elements from the DOM.
```typescript
const removeEvent = removeFragments({
  selector: '#listing'
});
```

### /remove-signals
Removes signals from client-side state.
```typescript
const removeEvent = removeSignals({
  paths: ['foo', 'nested.baz']
});
```

### /execute-script
Executes JavaScript code on the client side.
```typescript
const executeEvent = executeScript({
  autoRemove: true,
  attributes: [
    { name: 'type', value: 'module' },
    { name: 'defer', value: true }
  ],
  scripts: [
    'console.log("Hello, world!")',
    'console.log("Here is a second console line to output!")'
  ]
});
```

### /heartbeat
Sends a timestamp every second to keep the connection alive. This is an example of an ad-hoc Event type that doesn't use our standard event factories. It's particularly useful in the Cloudflare Workers environment where connections might be closed due to:
- CPU usage limits
- Connection timeouts
- Worker instance recycling

The heartbeat ensures the connection stays alive and provides a way to detect connection issues on the client side.

```typescript
const timestampEvent = {
  type: null,
  format() {
    return `: ${new Date().toLocaleTimeString()}\n\n`;
  },
  _repeating: {
    frequency: 1000,
    originalEvent: null
  }
};
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Deploy to Cloudflare
npm run deploy
```

## Testing

The project uses Vitest for testing, providing a fast and efficient testing environment for Cloudflare Workers. The test suite includes comprehensive coverage of all SSE event types and edge cases.

### Test Structure

Tests are organized by feature in the `test` directory:
- `index.spec.ts`: Main router and endpoint tests
- `mergeFragments.spec.ts`: Fragment merging functionality
- `mergeSignals.spec.ts`: Signal state management
- `removeFragments.spec.ts`: Fragment removal
- `removeSignals.spec.ts`: Signal removal
- `executeScript.spec.ts`: Script execution
- `recurring.spec.ts`: Repeating event functionality

### Test Coverage

The test suite provides comprehensive coverage of:
- All SSE event types and their formats
- Dynamic content generation
- Repeating events and intervals
- Stream handling and cleanup
- Error cases and edge conditions
- Response headers and content types

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test test/mergeFragments.spec.ts
```