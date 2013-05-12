'use strict';

describe('Service: aceData', function () {

  // load the service's module
  beforeEach(module('codecollabUiApp'));

  // instantiate service
  var aceData;
  beforeEach(inject(function (_aceData_) {
    aceData = _aceData_;
  }));

  it('should do something', function () {
    expect(!!aceData).toBe(true);
  });

});
