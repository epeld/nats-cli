
# Hello World!

This is a command line interface to nats.

You can:
- Perform a request-reply exchange
- Publish a message
- Subscribe to a message

## Setup
Clone the repo and run

    npm install
    
then you can start the app using

    node app.js
    
or use the helper

    ./nats-cli

## Usage

Request example (assuming there is a counterpart that will answer 'World!') on the other end:

    nats-cli -Q hello
    > World!
    
Publish example

    nats-cli -P hello.all
    
Subscribe example

    nats-cli -S 'hello.>'
    > hello
    > hello.all
    

Also try

    nats-cli --help
    
for more options.

