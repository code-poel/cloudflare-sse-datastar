export interface Env {
	// Add your environment variables here
}

// Request Extension
export type ExtReq = {
  userId?: number
}

// Context Extension
export type ExtCtx = {
  //sentry?: Toucan
}

export type MergeMode = 'morph' | 'inner' | 'outer' | 'prepend' | 'append' | 'before' | 'after' | 'upsertAttributes';

/**
 * A function that generates HTML content dynamically.
 * This is used for content that needs to be re-evaluated on each event.
 * @returns {string} The HTML content to be inserted
 */
export type FragmentGenerator = () => string;

/**
 * Base interface for all SSE events
 */
export interface Event {
  /** The type of event (used for client-side event handling) */
  type: string;
  /** Formats the event for SSE transmission */
  format(): string;
  /** Optional configuration for repeating events */
  _repeating?: {
    /** Frequency in milliseconds between repeats */
    frequency: number;
    /** The original event to repeat (if using repeatingEvent helper) */
    originalEvent: Event | null;
  };
  /** Optional retry time in milliseconds for reconnection */
  retry?: number;
}

/**
 * Event for updating HTML content on the client side.
 * The fragment can be either static HTML or a function that generates HTML dynamically.
 */
export interface DatastarMergeFragmentsEvent extends Event {
  type: 'datastar-merge-fragments';
  /** 
   * The HTML content to insert.
   * - Use a string for static content that doesn't change
   * - Use a function for dynamic content that needs to be re-evaluated on each event
   */
  fragment: string | FragmentGenerator;
  /** CSS selector for the target element to update */
  selector?: string;
  /** How to merge the new content with existing content */
  mergeMode?: MergeMode;
  /** Whether to use View Transitions API for the update */
  useViewTransition?: boolean;
}

/**
 * Event for updating client-side state
 */
export interface DatastarMergeSignalsEvent extends Event {
  type: 'datastar-merge-signals';
  /** The state object to merge with client-side state */
  signals: object;
  /** Only update signals that don't already exist */
  onlyIfMissing?: boolean;
}

export interface DatastarRemoveFragmentsEvent extends Event {
  type: 'datastar-remove-fragments';
  selector: string;
}

export interface DatastarRemoveSignalsEvent extends Event {
  type: 'datastar-remove-signals';
  /** Array of signal paths to remove from client-side state */
  paths: Array<string>;
}

export interface DatastarExecuteScriptEvent extends Event {
  type: 'datastar-execute-script';
  /** Whether to remove the script element after execution */
  autoRemove?: boolean;
  /** Array of attributes to add to the script element */
  attributes: Array<{ name: string; value: string | boolean }>;
  /** Array of JavaScript code lines to execute */
  scripts: Array<string>;
}