
'use strict';

describe("Test inheritance", function () {

  const Emitter = require('../emitter');


  it("should create valid instance", function () {
    const util = require('util');
    const SubEmitter = function () {};

    let events;

    util.inherits(SubEmitter, Emitter);

    events = new SubEmitter();

    events.should.be.instanceOf(Emitter);

    events.should.not.have.ownProperty('_events');
    events.should.not.have.ownProperty('_eventsCount');

    return events.on('foo', function () {}).then(function () {

      events.should.have.ownProperty('_events').and.have.ownProperty('foo').be.a.Function;
      events.should.have.ownProperty('_eventsCount').equal(1);

    });

  });

});
