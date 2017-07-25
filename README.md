
# Hello World!

This is a command line interface to nats.

You can:
- Perform a request-reply exchange
- Publish a message
- Subscribe to a message

## Usage

Request example (assuming there is a counterpart that will answer 'World!') on the other end:

    nats-cli -Q hello
    > World!
    
Publish example

    nats-cli -P hello.all
    
Subscribe example

    nats-cli -S hello.>
    > hello
    > hello.all
    

Also try

    nats-cli --help
    
for more options.
