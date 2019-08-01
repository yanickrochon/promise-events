
'use strict';

describe("Test domains", function () {
  const Emitter = require('../emitter');


  //it("should use domain events");

  it('should set default domain using option', function () {
    let originalValue = Emitter.usingDomains;

    Emitter.usingDomains = true;
    expect( Emitter.usingDomains ).toBe(true);
    Emitter.usingDomains = false;
    expect( Emitter.usingDomains ).toBe(false);

    Emitter.usingDomains = originalValue;
  });

});