
var domain;


module.exports = EventEmitter;
module.exports.EventEmitter = EventEmitter;


function EventEmitter() {
  init(this);
}


EventEmitter.defaultMaxListeners = 10;
EventEmitter.usingDomains = true;
EventEmitter.listenerCount = listenerCount;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.prototype.getMaxListeners = getMaxListeners;
EventEmitter.prototype.setMaxListeners = setMaxListeners
EventEmitter.prototype.emit = emit;
EventEmitter.prototype.addListener = addListener;
EventEmitter.prototype.on = addListener;
EventEmitter.prototype.once = once;
EventEmitter.prototype.removeListener = removeListener;
EventEmitter.prototype.removeAllListeners = removeAllListeners;
EventEmitter.prototype.listeners = listeners;


function init(emitter) {
  emitter.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    domain = domain || require('domain');
    if (domain.active && !(emitter instanceof domain.Domain)) {
      emitter.domain = domain.active;
    }
  }
  if (!emitter._events || emitter._events === Object.getPrototypeOf(emitter)._events) {
    emitter._events = {};
    emitter._eventsCount = 0;
  }
  emitter._maxListeners = emitter._maxListeners || undefined;
}


function getMaxListeners() {
  return this._maxListeners || EventEmitter.defaultMaxListeners;
}


function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n)) {
    throw new TypeError('n must be a positive number');
  }

  this._maxListeners = n;

  return this;
}


function addListener(type, listener) {
  var m;
  var events;
  var existing;
  var promise;

  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  events = this._events;

  if (!events) {
    events = this._events = {};
    this._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      promise = this.emit('newListener', type, listener.listener ? listener.listener : listener);
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don\'t need the extra array object.
    existing = events[type] = listener;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = [existing, listener];
    } else {
      // If we've already got an array, just append.
      existing.push(listener);
    }
    // Check for listener leak
    if (!existing.warned) {
      m = this.getMaxListeners();
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        console.error('warning: possible EventEmitter memory ' +
                      'leak detected. %d %s listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      existing.length, type);
        console.trace();
      }
    }
  }
  ++this._eventsCount;

  return promise || Promise.resolve();
}


function once(type, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  var emitter = this;
  var fired = false;
  var promise;

  function g() {
    if (!fired) {
      var args = arguments;

      fired = true;
      promise = emitter.removeListener(type, g).then(function () {
        return listener.apply(this, args);
      });
    }

    return promise;
  }

  g.listener = listener;

  return this.on(type, g);
}


function removeListener(type, listener) {
  var list, events, position, i;
  var promise;

  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }

  events = this._events;

  if (!events) {
    return Promise.resolve();
  }

  list = events[type];

  if (!list) {
    return Promise.resolve();
  }

  if (list === listener || (list.listener && list.listener === listener)) {
    if (--this._eventsCount === 0) {
      this._events = {};
    } else {
      delete events[type];

      if (events.removeListener) {
        promise = this.emit('removeListener', type, listener);
      }
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0) {
      return Promise.resolve();
    }

    if (list.length === 1) {
      list[0] = undefined;

      if (this._eventsCount === 1) {
        this._events = {};
        this._eventsCount = 0;

        return Promise.resolve();
      } else {
        delete events[type];
      }
    } else {
      list.splice(position, 1);

      if (list.length === 1) {
        events[type] = list[0];
      }
    }
    --this._eventsCount;

    if (events.removeListener) {
      promise = this.emit('removeListener', type, listener);
    }
  }

  return promise || Promise.resolve();
}


function removeAllListeners(type) {
  var listeners, events;
  var promise;

  events = this._events;

  if (!events) {
    return Promise.resolve();
  }

  // not listening for removeListener, no need to emit
  if (!events.removeListener) {
    if (arguments.length === 0) {
      this._eventsCount = 0;
      this._events = {};
    } else if (events[type]) {
      if (this._eventsCount === 1) {
        this._eventsCount = 0;
        this._events = {};
      } else {
        this._eventsCount = this._eventsCount - (typeof events[type] === 'function' ? 1 : events[type].length);
        delete events[type];
      }
    }

    return Promise.resolve();
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    var keys = Object.keys(events);

    for (var i = 0, key; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;

      promise = promise && promise.then(this.removeAllListeners.bind(this, key)) || this.removeAllListeners(key);
    }

    promise = promise && promise.then(this.removeAllListeners.bind(this, 'removeListener')) || this.removeAllListeners('removeListener');
    this._events = {};
    this._eventsCount = 0;

    return promise || Promise.resolve();
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    promise = this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    for (var i = listeners.length; i >= 0; --i) {
      promise = promise && promise.then(this.removeListener.bind(this, type, listeners[i])) || this.removeListener(type, listeners[i]);
    }
  }

  return promise || Promise.resolve();
}


function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events) {
    ret = [];
  } else {
    evlistener = events[type];

    if (!evlistener) {
      ret = [];
    } else if (typeof evlistener === 'function') {
      ret = [evlistener];
    } else {
      ret = evlistener.slice();
    }
  }

  return ret;
}


function listenerCount(emitter, type) {
  var evlistener;
  var ret = 0;
  var events = emitter._events;
  if (events) {
    evlistener = events[type];
    if (typeof evlistener === 'function') {
      ret = 1;
    } else if (evlistener) {
      ret = evlistener.length;
    }
  }
  return ret;
}


function emit(type) {
  var er, handler, isFn, len, args, i, events, domain;
  var needDomainExit = false;
  var doError = (type === 'error');
  var promise;

  events = this._events;

  if (events) {
    doError = (doError && events.error == null);
  } else if (!doError) {
    return Promise.resolve();
  }

  domain = this.domain;

  // If there is no 'error' event listener then reject
  if (doError) {
    er = arguments[1];

    if (er) {
      if (!(er instanceof Error)) {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        er = err;
      }
    } else {
      er = new Error('Uncaught, unspecified "error" event.');
    }

    if (domain) {
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    }

    return Promise.reject(er);
  }

  handler = events[type];

  if (!handler) {
    return Promise.resolve();
  }

  if (domain && this !== process) {
    domain.enter();
    needDomainExit = true;
  }

  isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      promise = emitNone(handler, isFn, this);
      break;
    case 2:
      promise = emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      promise = emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      promise = emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; ++i) {
        args[i - 1] = arguments[i];
      }
      promise = emitMany(handler, isFn, this, args);
  }

  if (needDomainExit) {
    promise.then(function () {
      domain.exit();
    });
  }

  return promise;
}


function emitNone(handler, isFn, emitter) {
  var promiseList;
  var handlers;
  var i, len;

  if (isFn) {
    promiseList = [handler.call(emitter)];
  } else {
    handlers = handler.slice();
    promiseList = [];

    for (i = 0, len = handlers.length; i < len; ++i) {
      promiseList[i] = handlers[i].call(emitter);
    }
  }

  return Promise.all(promiseList);
}


function emitOne(handler, isFn, emitter, arg) {
  var promiseList;
  var handlers;
  var i, len;

  if (isFn) {
    promiseList = [handler.call(emitter, arg)];
  } else {
    handlers = handler.slice();
    len = handlers.length
    promiseList = new Array(len);

    for (i = 0; i < len; ++i) {
      promiseList[i] = handlers[i].call(emitter, arg);
    }
  }

  return Promise.all(promiseList);
}


function emitTwo(handler, isFn, emitter, arg1, arg2) {
  var promiseList;
  var i, len;

  if (isFn) {
    promiseList = [handler.call(emitter, arg1, arg2)];
  } else {
    handlers = handler.slice();
    len = handlers.length
    promiseList = new Array(len);

    for (i = 0; i < len; ++i) {
      promiseList[i] = handlers[i].call(emitter, arg1, arg2);
    }
  }

  return Promise.all(promiseList);
}


function emitThree(handler, isFn, emitter, arg1, arg2, arg3) {
  var promiseList;
  var i, len;

  if (isFn) {
    promiseList = [handler.call(emitter, arg1, arg2, arg3)];
  } else {
    handlers = handler.slice();
    len = handlers.length
    promiseList = new Array(len);

    for (i = 0; i < len; ++i) {
      promiseList[i] = handlers[i].call(emitter, arg1, arg2, arg3);
    }
  }

  return Promise.all(promiseList);
}


function emitMany(handler, isFn, emitter, args) {
  var promiseList;
  var i, len;

  if (isFn) {
    promiseList = [handler.apply(emitter, args)];
  } else {
    handlers = handler.slice();
    len = handlers.length
    promiseList = new Array(len);

    for (i = 0; i < len; ++i) {
      promiseList[i] = handlers[i].apply(emitter, args);
    }
  }

  return Promise.all(promiseList);
}