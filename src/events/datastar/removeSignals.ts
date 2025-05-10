import { DatastarRemoveSignalsEvent } from '../../types';

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
 * @example
 * // With retry configuration
 * removeSignals({
 *   paths: ['foo'],
 *   retry: 5000  // Will retry connection after 5 seconds if disconnected
 * });
 * 
 * @param options - Configuration for the remove signals event
 * @param options.paths - Array of signal paths to remove from client-side state
 * @param options.retry - Number of milliseconds to wait before retrying connection if disconnected. If null or undefined, no retry will be attempted.
 * @returns A remove signals event
 */
export default function removeSignals({ 
  paths,
  retry = null
}: Omit<DatastarRemoveSignalsEvent, 'type' | 'format'>): DatastarRemoveSignalsEvent {
  return {
    type: 'datastar-remove-signals',
    paths,
    retry,
    format() {
      const options = [
        ...this.paths.map((path: string) => `data: paths ${path}`),
        (this.retry === null || this.retry === undefined) ? null : `retry: ${this.retry}`
      ].filter(Boolean);

      return [
        'event: datastar-remove-signals',
        ...options
      ].join('\n') + '\n\n';
    }
  };
}