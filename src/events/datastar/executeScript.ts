import { DatastarExecuteScriptEvent } from "../../types";

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
 * @param options - Configuration for the execute script event
 * @param options.autoRemove - Whether to remove the script element after execution
 * @param options.attributes - Array of attributes to add to the script element
 * @param options.scripts - Array of JavaScript code lines to execute
 * @returns An execute script event
 */
export default function executeScript({ 
  autoRemove = null,
  attributes = [],
  scripts
}: Omit<DatastarExecuteScriptEvent, 'type' | 'format'>): DatastarExecuteScriptEvent {
  return {
    type: 'datastar-execute-script',
    autoRemove,
    attributes,
    scripts,
    format() {
      const options = [
        this.autoRemove !== null && `data: autoRemove ${this.autoRemove}`,
        ...this.attributes.map(attr => `data: attributes ${attr.name} ${attr.value}`),
        ...this.scripts.map(script => `data: script ${script}`)
      ].filter(Boolean);

      return [
        'event: datastar-execute-script',
        ...options
      ].join('\n') + '\n\n';
    }
  };
}
