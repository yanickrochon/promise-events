# Promise Events

[![Build Status](https://travis-ci.org/yanickrochon/promise-events.svg?branch=master)](https://travis-ci.org/yanickrochon/promise-events)
[![Coverage Status](https://coveralls.io/repos/yanickrochon/promise-events/badge.svg)](https://coveralls.io/r/yanickrochon/promise-events)

[![NPM](https://nodei.co/npm/promise-events.png?compact=true)](https://nodei.co/npm/promise-events/)

An asynchronous event listener for Promise/A+ implementations. This module implements a compatible `EventEmitter` interface, where all functions return a promise for easy workflow.

The emitter can work either synchronously or asynchrnously. However, all events are fired asynchronously.


### Usage


```javascript
const EventEmitter = require('promise-events');

var events = new EventEmitter();

// synchronous
events.on('syncEvent', function (hello) {
  console.log(hello);
});

events.emit('syncEvent', 'hello!');


// asynchronous
Promise.all([
  events.on('asyncEvent', function (hello) {
    console.log('Handler 1', hello);
    return 'Bye!';
  }),
  events.on('asyncEvent', function (hello) {
    console.log('Handler 2', hello);
  })
]).then(function () {
  console.log("Event added and any newListener listeners fired!");
}).then(function () {

  events.emit('asyncEvent', 'Hello async!').then(function (results) {
    console.log(results);
    // results = [ 'Bye!', undefined ]
  });

});
```

All listeners are executed using [`Promise.all`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise.all). You can specify a filter function for the array of return values using `events.setResultFilter(filter)` (resp. `events.getResultFilter()` and `EventEmitter.defaultResultFilter`, analogous to `EventEmitter.defaultMaxListeners`). The order of the items in `results` is undefined. Therefore, the number of listeners and the order they are added to the emitter does not garantee the order or number of values returned when emitting an event; do not rely on `results` to determine a listener's return value.

A call to `events.emit` will always resolve with an array if successful or be rejected with a single `Error` upon any failure, at any given time, for any number of listeners (i.e. the first error thrown will be passed to the rejection callback and all subsequent will be ignored).


## Contribution

All contributions welcome! Every PR **must** be accompanied by their associated
unit tests!


## License

MIT
