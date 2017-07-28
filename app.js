

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
    short: 'p',
    type: 'string',
    description: 'Nats password - if any'
  },
  {
    name: 'url',
    short: 'h',
    type: 'string',
    description: 'Nats url. Default nats://127.0.0.1:4222'
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
const user = args.options.user || '';
const password = args.options.password || '';

const url = args.options.host || 'nats://127.0.0.1:4222';

let nc;
try {
  let config = {
    user, password, url
  };
  nc = nats.connect(config);
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
