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
 * @returns A remove fragments event
 */
export default function removeFragments({ 
  selector, 
}: Omit<DatastarRemoveFragmentsEvent, 'type' | 'format'>): DatastarRemoveFragmentsEvent {
  return {
    type: 'datastar-remove-fragments',
    selector,
    format() {
      return [
        'event: datastar-remove-fragments',
        'data: selector ' + this.selector
      ].join('\n') + '\n\n';
    }
  };
}