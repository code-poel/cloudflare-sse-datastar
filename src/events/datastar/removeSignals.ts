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
 * @param options - Configuration for the remove signals event
 * @param options.paths - Array of signal paths to remove from client-side state
 * @returns A remove signals event
 */
export default function removeSignals({ 
  paths, 
}: Omit<DatastarRemoveSignalsEvent, 'type' | 'format'>): DatastarRemoveSignalsEvent {
  return {
    type: 'datastar-remove-signals',
    paths,
    format() {
      return [
        'event: datastar-remove-signals',
        ...this.paths.map((path: string) => `data: paths ${path}`)
      ].join('\n') + '\n\n';
    }
  };
}