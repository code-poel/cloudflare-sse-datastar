import { Router } from '@tsndr/cloudflare-worker-router';
import { ExtCtx, ExtReq, Event } from './types';
import { createSSEResponse } from './sse';
import mergeFragments from './events/datastar/mergeFragments';
import mergeSignals from './events/datastar/mergeSignals';
import removeFragments from './events/datastar/removeFragments';
import removeSignals from './events/datastar/removeSignals';
import executeScript from './events/datastar/executeScript';
import repeatingEvent from './events/recurring';

import Mustache from 'mustache';
import listingTemplate from './templates/listing.mustache';
Mustache.parse(listingTemplate);

// Initialize Router
const router = new Router<Env, ExtCtx, ExtReq>();

// Enabling build in CORS support
router.cors();

function getListingMarkup(): string {
	const data = { names: [{ name: 'John' }, { name: 'Jane' }, { name: 'Jim' }, { name: 'Jill' }] }
	const markup = Mustache.render(listingTemplate, data);
	return markup;
}

router.get('/merge-fragments', async () => {
  const event = mergeFragments({
    fragment: getListingMarkup()
  });
  return createSSEResponse([event]);
});

router.get('/merge-fragments-repeating', async () => {
  const event = mergeFragments({
    fragment: () => `<div id="clock">${new Date().toLocaleTimeString('en-US', { hour12: false })}:${new Date().getMilliseconds()}</div>`,
    selector: '#clock'
  });
  const repeatEvent = repeatingEvent(event, 1000);
  return createSSEResponse([repeatEvent]);
});

router.get('/merge-signals', async () => {
  const event = mergeSignals({
    signals: {
      foo: 'merged',
      nested: {
        baz: 'merged'
      }
    }
  });
  return createSSEResponse([event]);
});

router.get('/remove-fragments', async () => {
  const removeEvent = removeFragments({
    selector: '#content-to-remove'
  });
  return createSSEResponse([removeEvent]);
});

router.get('/remove-signals', async () => {
  const removeEvent = removeSignals({
    paths: ['foo', 'nested.bar']
  });
  return createSSEResponse([removeEvent]);
});

router.get('/execute-script', async () => {
  const executeEvent = executeScript({
    autoRemove: true,
    attributes: [
      { name: 'type', value: 'module' },
      { name: 'defer', value: true }
    ],
    scripts: [
      'console.log("Hello from the execute script event!");',
      'alert(document.getElementById("display-in-alert").textContent);'
    ]
  });
  return createSSEResponse([executeEvent]);
});

router.get('/heartbeat', async () => {
  const timestampEvent = {
    type: null,
    format() {
      return `: ${new Date().toLocaleTimeString('en-US', { hour12: false })}:${new Date().getMilliseconds()}\n\n`;
    },
    _repeating: {
      frequency: 1000,
      originalEvent: null
    }
  };

  return createSSEResponse([timestampEvent]);
});

router.get('/clock', async () => {
  const event = mergeFragments({
    fragment: () => `<div id="clock">${new Date().toLocaleTimeString('en-US', { hour12: false })}:${new Date().getMilliseconds()}</div>`
  });
  const repeatEvent = repeatingEvent(event, 150);
  return createSSEResponse([repeatEvent]);
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.handle(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
