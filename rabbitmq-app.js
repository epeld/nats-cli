

const amqp = require('amqp');
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
    short: 's',
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

const url = args.options.host || '127.0.0.1:5672';

const errorHandler = (err) => {
  console.error(err);
  argv.help();
  process.exit(0);
};

let rc;
try {
  rc = amqp.createConnection(`amqp://${user}:${password}@${url}`);
  rc.on('error', errorHandler);
} catch (e) {
  errorHandler(e);
}

const cleanup = () => {
  try {
    rc.disconnect();
  } catch (e) {
    //
  }
  process.exit(0);
};

const amqpOptions = {
  contentType: 'application/json'
};

/*
 *  Main procedure
 */
const data = args.options.data || '';
// const timeout = args.options.timeout || 1000;

if ('request' in args.options) {
  console.warn('Not supported yet');
  process.exit(1);
  // const request = args.options.request || 'cli.request';
  // nc.requestOne(request, data, {}, timeout, (response) => {
  //   if (response.code && response.code === nats.REQ_TIMEOUT) {
  //     console.error('Request timed out.');
  //   } else {
  //     console.log(response);
  //   }
  //   cleanup();
  // });
} else if ('publish' in args.options) {
  const publish = args.options.publish || 'cli.hello.world';
  rc.publish(publish, data, amqpOptions, (response) => {
    cleanup();
  });
} else if ('subscribe' in args.options) {
  const subscribe = args.options.subscribe || '>';
  const autoreply = args.options['auto-reply'];
  rc.queue(subscribe, (q) => {
    q.subscribe((msg, headers, deliveryInfo) => {
      if (!data || data === '') {
        // Fall back on logging topic in case message is missing
        console.log(deliveryInfo.routingKey || subscribe);
      } else {
        console.log(data);
      }

      if (autoreply) {
        if (!deliveryInfo.replyTo) {
          console.warn('No replyTo-address!');
        } else {
          rc.publish(deliveryInfo.replyTo, autoreply, amqpOptions);
        }
      }
    });
  });
}
