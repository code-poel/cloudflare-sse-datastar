import { ExecuteScriptOptions, ExecuteScriptEvent } from '../../types';
import { createEventFactory, formatSSE } from '../utils';

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
        return formatSSE(this.type, {
          autoRemove: this.autoRemove,
          attributes: this.attributes,
          scripts: this.scripts,
          retry: this.retry
        });
      }
    })
  }
);
