'use strict';

describe('Service: protocolHandler', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var protocolHandler;
  beforeEach(inject(function (_protocolHandler_) {
    protocolHandler = _protocolHandler_;
  }));

  it('should do something', function () {
    expect(!!protocolHandler).toBe(true);
  });

});
