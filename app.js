

const nats = require('nats');
const argv = require('argv');

const options = [
  {
    name: 'user',
    short: 'U',
    type: 'string',
    description: 'Nats username - if any'
  },
  {
    name: 'password',
    short: 'W',
    type: 'string',
    description: 'Nats password - if any'
  },
  {
    name: 'port',
    short: 'p',
    type: 'string',
    description: 'Nats port. Default 4222'
  },
  {
    name: 'host',
    short: 'h',
    type: 'string',
    description: 'Nats port. Default 4222'
  },
  {
    name: 'request',
    short: 'Q',
    type: 'string',
    description: 'Send a request'
  },
  {
    name: 'publish',
    short: 'P',
    type: 'string',
    description: 'Publish a message'
  },
  {
    name: 'subscribe',
    short: 'S',
    type: 'string',
    description: 'Subscribe to a topic'
  },
  {
    name: 'data',
    short: 'd',
    type: 'string',
    description: 'Message payload'
  },
  {
    name: 'topic',
    short: 't',
    type: 'string',
    description: 'Nats Topic'
  },
  {
    name: 'timeout',
    short: 'T',
    type: 'string',
    description: 'Request Timeout'
  },
  {
    name: 'auto-reply',
    short: 'R',
    type: 'string',
    description: 'When subscribing, specify an auto-reply on all received messages'
  }
];

options.forEach(opt => argv.option(opt));

if (process.argv.length < 3) {
  argv.help();
  process.exit(0);
}

const args = argv.run();

/*
 *  Setup Nats
 */
const user = options.user || '';
const password = options.password || '';

const host = options.host || '';
const port = options.port || 4222;

let nc;
try {
  nc = nats.connect({
    user, password, host, port
  });
} catch (e) {
  console.error(e);
  argv.help();
  process.exit(0);
}

const cleanup = () => {
  try {
    nc.close();
  } catch (e) {
    //
  }
  process.exit(0);
};

/*
 *  Main procedure
 */
const data = args.options.data || '';
const timeout = args.options.timeout || 1000;

if ('request' in args.options) {
  const request = args.options.request || 'cli.request';
  nc.requestOne(request, data, {}, timeout, (response) => {
    if (response.code && response.code === nats.REQ_TIMEOUT) {
      console.error('Request timed out.');
    } else {
      console.log(response);
    }
    cleanup();
  });
} else if ('publish' in args.options) {
  const publish = args.options.publish || 'cli.hello.world';
  nc.publish(publish, data, (response) => {
    cleanup();
  });
} else if ('subscribe' in args.options) {
  const subscribe = args.options.subscribe || '>';
  const autoreply = args.options['auto-reply'];
  nc.subscribe(subscribe, (data, replyTo, topic) => {
    if (!data || data === '') {
      // Fall back on logging topic in case message is missing
      console.log(topic);
    } else {
      console.log(data);
    }

    if (autoreply) {
      nc.publish(replyTo, autoreply);
    }
  });
}
