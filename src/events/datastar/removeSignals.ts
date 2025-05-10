import { RemoveSignalsOptions, RemoveSignalsEvent } from '../../types';
import { createEventFactory, formatSSE } from '../utils';

/**
 * Creates an event for removing signals from client-side state.
 * Multiple signals can be removed at once by providing an array of paths.
 * 
 * @example
 * // Remove a single signal
 * removeSignals({
 *   paths: ['foo']
 * });
 * 
 * @example
 * // Remove multiple signals
 * removeSignals({
 *   paths: ['foo', 'nested.baz']
 * });
 * 
 * @param options - Configuration for the remove signals event
 * @returns A remove signals event
 */
export default createEventFactory<RemoveSignalsOptions>(
  'datastar-remove-signals',
  {
    required: ['paths'],
    format: (options) => ({
      type: 'datastar-remove-signals',
      ...options,
      format() {
        return formatSSE(this.type, {
          paths: this.paths,
          retry: this.retry
        });
      }
    })
  }
);