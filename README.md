# Promise Events

[![Build Status](https://travis-ci.org/yanickrochon/promise-events.svg?branch=master)](https://travis-ci.org/yanickrochon/promise-events)
[![Coverage Status](https://coveralls.io/repos/yanickrochon/promise-events/badge.svg)](https://coveralls.io/r/yanickrochon/promise-events)

[![NPM](https://nodei.co/npm/promise-events.png?compact=true)](https://nodei.co/npm/promise-events/)

An asynchronous event listener for Promise/A+ implementations. This module implements a compatible `EventEmitter` interface, where all functions return a promise for easy workflow.


### Usage

```
var events = new require('promise-events').EventEmitter();


events.on('foo', function standardHandler() {
  console.log('Simple foo called!');

}).then(events.on('foo', function asyncHandler(credentials) {
  console.log("Waiting for 2nd handler...");

  return new Promise(function (resolve) {
    processRemoteData(credentials, function (err, result) {
      console.log("Done!");
      resolve(result);  // = "Hello world!"
    });
  });
}));

// ... later...

events.emit('foo', { user: 'me', pass: 's3cr37'}).then(function (results) {
  // result[0] == undefined (no return value from standardHandler
  // result[1] == "Hello world!"
});

```

All listeners are executed using [`Promise.all`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise.all).


## Contribution

All contributions welcome! Every PR **must** be accompanied by their associated
unit tests!


## License

MIT