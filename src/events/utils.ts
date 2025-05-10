import { BaseEvent, BaseEventOptions } from '../types';
import minifyHtml from '../minify';

/**
 * Formats an SSE event with the given type and data
 */
export function formatSSE(type: string, data: Record<string, any>): string {
  const lines = [`event: ${type}`];
  
  // Handle retry separately as it needs to be a direct line
  if (data.retry !== undefined && data.retry !== null) {
    lines.push(`retry: ${data.retry}`);
    delete data.retry;
  }
  
  // Handle other data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Special handling for arrays that need to be output as separate lines
      if (Array.isArray(value)) {
        if (key === 'paths') {
          // Each path gets its own line
          value.forEach(path => {
            lines.push(`data: paths ${path}`);
          });
        } else if (key === 'attributes') {
          // Each attribute gets its own line
          value.forEach(attr => {
            lines.push(`data: attributes ${attr.name} ${attr.value}`);
          });
        } else if (key === 'scripts') {
          // Each script gets its own line
          value.forEach(script => {
            lines.push(`data: script ${script}`);
          });
        } else {
          // Default array handling
          lines.push(`data: ${key} ${JSON.stringify(value)}`);
        }
      } else if (typeof value === 'object') {
        // Handle objects (like signals)
        lines.push(`data: ${key} ${JSON.stringify(value)}`);
      } else {
        // Handle primitive values
        lines.push(`data: ${key} ${value}`);
      }
    }
  });
  
  return lines.join('\n') + '\n\n';
}

/**
 * Creates an event factory with the given configuration
 */
export function createEventFactory<T extends BaseEventOptions>(
  type: string,
  config: {
    required: Array<keyof T>;
    format: (options: T) => BaseEvent<string>;
  }
) {
  return (options: T) => {
    // Validate required fields
    config.required.forEach(field => {
      if (options[field] === undefined) {
        throw new Error(`Missing required field: ${String(field)}`);
      }
    });
    
    return config.format(options);
  };
}

/**
 * Creates a repeating event with the given frequency
 */
export function createRepeatingEvent<T extends BaseEvent<string>>(
  event: T,
  frequency: number
): T {
  return {
    ...event,
    _repeating: {
      frequency,
      originalEvent: event
    }
  };
} 