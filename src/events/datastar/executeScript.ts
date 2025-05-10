import { ExecuteScriptOptions, ExecuteScriptEvent } from '../../types';
import { createEventFactory } from '../utils';

/**
 * Creates an event for executing JavaScript code on the client side.
 * The script can be executed with custom attributes and can be automatically removed after execution.
 * 
 * @example
 * // Execute a simple script
 * executeScript({
 *   scripts: ['console.log("Hello, world!")']
 * });
 * 
 * @example
 * // Execute a module script with attributes
 * executeScript({
 *   autoRemove: true,
 *   attributes: [
 *     { name: 'type', value: 'module' },
 *     { name: 'defer', value: true }
 *   ],
 *   scripts: [
 *     'console.log("Hello, world!")',
 *     'console.log("A second greeting")'
 *   ]
 * });
 * 
 * @example
 * // With retry configuration
 * executeScript({
 *   scripts: ['console.log("test")'],
 *   attributes: [],
 *   retry: 5000  // Will retry connection after 5 seconds if disconnected
 * });
 * 
 * @param options - Configuration for the execute script event
 * @param options.autoRemove - Whether to remove the script element after execution
 * @param options.attributes - Array of attributes to add to the script element
 * @param options.scripts - Array of JavaScript code lines to execute
 * @param options.retry - Number of milliseconds to wait before retrying connection if disconnected. If null or undefined, no retry will be attempted.
 * @returns An execute script event
 */
export default createEventFactory<ExecuteScriptOptions>(
  'datastar-execute-script',
  {
    required: ['scripts'],
    format: (options) => ({
      type: 'datastar-execute-script',
      ...options,
      format() {
        const lines = [`event: ${this.type}`];
        
        // Add autoRemove if specified
        if (this.autoRemove !== undefined && this.autoRemove !== null) {
          lines.push(`data: autoRemove ${this.autoRemove}`);
        }
        
        // Add each attribute as a separate line
        this.attributes.forEach(attr => {
          lines.push(`data: attributes ${attr.name} ${attr.value}`);
        });
        
        // Add each script as a separate line
        this.scripts.forEach(script => {
          lines.push(`data: script ${script}`);
        });
        
        // Add retry if specified
        if (this.retry !== undefined && this.retry !== null) {
          lines.push(`retry: ${this.retry}`);
        }
        
        return lines.join('\n') + '\n\n';
      }
    })
  }
);
