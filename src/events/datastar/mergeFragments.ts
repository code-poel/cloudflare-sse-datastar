import { MergeFragmentsOptions, MergeFragmentsEvent } from '../../types';
import { createEventFactory, formatSSE } from '../utils';
import minifyHtml from '../../minify';

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
export default createEventFactory<MergeFragmentsOptions>(
  'datastar-merge-fragments',
  {
    required: ['fragment'],
    format: (options) => ({
      type: 'datastar-merge-fragments',
      ...options,
      format() {
        const fragmentContent = typeof this.fragment === 'function' 
          ? this.fragment() 
          : this.fragment;

        return formatSSE(this.type, {
          fragments: minifyHtml(fragmentContent),
          selector: this.selector,
          mergeMode: this.mergeMode,
          useViewTransition: this.useViewTransition,
          retry: this.retry
        });
      }
    })
  }
);