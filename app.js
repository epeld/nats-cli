

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
  }
];

options.forEach(opt => argv.option(opt));

const args = argv.run();

/*
 *  Setup Nats
 */
const user = options.user || '';
const password = options.password || '';

const host = options.host || '';
const port = options.port || '';

const nc = nats.connect({
  user, password, host, port
});

const cleanup = () => {
  try {
    nc.close();
  } catch (e) {
    //
  }
  process.exit(0);
};

const topic = args.options.topic || 'cli.hello.world';
const data = args.options.data || '';
const timeout = args.options.timeout || 1000;

if ('request' in args.options) {
  nc.requestOne(topic, data, {}, timeout, (response) => {
    if (response.code && response.code === nats.REQ_TIMEOUT) {
      console.error('Request timed out.');
    } else {
      console.log(response);
    }
    cleanup();
  });
} else if ('publish' in args.options) {
  nc.publish(topic, data, (response) => {
    cleanup();
  });
} else if ('subscribe' in args.options) {
  nc.subscribe(topic, (data) => {
    console.log(data);
  });
}
