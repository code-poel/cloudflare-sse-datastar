import { DatastarRemoveFragmentsEvent } from '../../types';

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
 * @param options.selector - CSS selector for the elements to remove
 * @param options.retry - Retry count for the event
 * @returns A remove fragments event
 */
export default function removeFragments({ 
  selector,
  retry = null
}: Omit<DatastarRemoveFragmentsEvent, 'type' | 'format'>): DatastarRemoveFragmentsEvent {
  return {
    type: 'datastar-remove-fragments',
    selector,
    retry,
    format() {
      const options = [
        'data: selector ' + this.selector,
        (this.retry === null || this.retry === undefined) ? null : `retry: ${this.retry}`
      ].filter(Boolean);

      return [
        'event: datastar-remove-fragments',
        ...options
      ].join('\n') + '\n\n';
    }
  };
}