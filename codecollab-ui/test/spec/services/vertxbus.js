'use strict';

describe('Service: vertxbus', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var vertxbus;
  beforeEach(inject(function (_vertxbus_) {
    vertxbus = _vertxbus_;
  }));

  it('should do something', function () {
    expect(!!vertxbus).toBe(true);
  });

});
