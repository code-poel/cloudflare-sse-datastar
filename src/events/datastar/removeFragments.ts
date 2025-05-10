import { RemoveFragmentsOptions, RemoveFragmentsEvent } from '../../types';
import { createEventFactory, formatSSE } from '../utils';

/**
 * Creates an event for removing HTML elements from the DOM.
 * Elements matching the selector will be removed from the document.
 * 
 * @example
 * // Remove a single element
 * removeFragments({
 *   selector: '#target'
 * });
 * 
 * @example
 * // Remove multiple elements
 * removeFragments({
 *   selector: '.to-remove'
 * });
 * 
 * @param options - Configuration for the remove fragments event
 * @returns A remove fragments event
 */
export default createEventFactory<RemoveFragmentsOptions>(
  'datastar-remove-fragments',
  {
    required: ['selector'],
    format: (options) => ({
      type: 'datastar-remove-fragments',
      ...options,
      format() {
        return formatSSE(this.type, {
          selector: this.selector,
          retry: this.retry
        });
      }
    })
  }
);