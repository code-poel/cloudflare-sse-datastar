import minifyHtml from '../../minify';
import { DatastarMergeFragmentsEvent, FragmentGenerator } from '../../types';

/**
 * Creates an event for updating HTML content on the client side.
 * The fragment can be either static HTML or a function that generates HTML dynamically.
 * 
 * @example
 * // Static content
 * mergeFragments({
 *   fragment: '<div>Static content</div>',
 *   selector: '#target'
 * });
 * 
 * @example
 * // Dynamic content (re-evaluated on each event)
 * mergeFragments({
 *   fragment: () => `<div>Updated: ${new Date().toLocaleTimeString()}</div>`,
 *   selector: '#clock'
 * });
 * 
 * @example
 * // With retry configuration
 * mergeFragments({
 *   fragment: '<div>Test</div>',
 *   selector: '#target',
 *   retry: 5000  // Will retry connection after 5 seconds if disconnected
 * });
 * 
 * @param options - Configuration for the merge fragments event
 * @param options.fragment - The HTML content to insert. Can be a string for static content or a function for dynamic content
 * @param options.selector - CSS selector for the target element to update
 * @param options.mergeMode - How to merge the new content with existing content
 * @param options.useViewTransition - Whether to use View Transitions API for the update
 * @param options.retry - Number of milliseconds to wait before retrying connection if disconnected. If null or undefined, no retry will be attempted.
 * @returns A merge fragments event
 */
export default function mergeFragments({ 
  fragment, 
  selector = null, 
  mergeMode = null,
  useViewTransition = null,
  retry = null
}: Omit<DatastarMergeFragmentsEvent, 'type' | 'format'>): DatastarMergeFragmentsEvent {
  return {
    type: 'datastar-merge-fragments',
    fragment,
    selector,
    mergeMode,
    useViewTransition,
    retry,
    format() {
      const options = [
        this.selector && `data: selector ${this.selector}`,
        this.mergeMode && `data: mergeMode ${this.mergeMode}`,
        this.useViewTransition && `data: useViewTransition ${this.useViewTransition}`,
        (this.retry === null || this.retry === undefined) ? null : `retry: ${this.retry}`
      ].filter(Boolean);

      // Get the fragment content, evaluating the function if needed
      const fragmentContent = typeof this.fragment === 'function' 
        ? (this.fragment as FragmentGenerator)() 
        : this.fragment;

      return [
        'event: datastar-merge-fragments',
        'data: fragments ' + minifyHtml(fragmentContent),
        ...options
      ].join('\n') + '\n\n';
    }
  };
}