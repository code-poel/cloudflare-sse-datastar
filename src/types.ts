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
 * Base options interface for all events
 */
export interface BaseEventOptions {
  retry?: number;
}

/**
 * Base interface for all SSE events
 */
export interface BaseEvent<T extends string> {
  type: T;
  format(): string;
  _repeating?: {
    frequency: number;
    originalEvent: BaseEvent<T> | null;
  };
}

/**
 * Event for updating HTML content on the client side.
 */
export interface MergeFragmentsOptions extends BaseEventOptions {
  fragment: string | FragmentGenerator;
  selector?: string;
  mergeMode?: MergeMode;
  useViewTransition?: boolean;
}

export interface MergeFragmentsEvent extends BaseEvent<'datastar-merge-fragments'> {
  fragment: string | FragmentGenerator;
  selector?: string;
  mergeMode?: MergeMode;
  useViewTransition?: boolean;
}

/**
 * Event for updating client-side state
 */
export interface MergeSignalsOptions extends BaseEventOptions {
  signals: Record<string, any>;
  onlyIfMissing?: boolean;
}

export interface MergeSignalsEvent extends BaseEvent<'datastar-merge-signals'> {
  signals: Record<string, any>;
  onlyIfMissing?: boolean;
}

/**
 * Event for removing HTML elements
 */
export interface RemoveFragmentsOptions extends BaseEventOptions {
  selector: string;
}

export interface RemoveFragmentsEvent extends BaseEvent<'datastar-remove-fragments'> {
  selector: string;
}

/**
 * Event for removing signals from client-side state
 */
export interface RemoveSignalsOptions extends BaseEventOptions {
  paths: Array<string>;
}

export interface RemoveSignalsEvent extends BaseEvent<'datastar-remove-signals'> {
  paths: Array<string>;
}

/**
 * Event for executing JavaScript code
 */
export interface ExecuteScriptOptions extends BaseEventOptions {
  autoRemove?: boolean;
  attributes: Array<{ name: string; value: string | boolean }>;
  scripts: Array<string>;
}

export interface ExecuteScriptEvent extends BaseEvent<'datastar-execute-script'> {
  autoRemove?: boolean;
  attributes: Array<{ name: string; value: string | boolean }>;
  scripts: Array<string>;
}