'use strict';

describe('Directive: stream', function () {
  beforeEach(module('codecollabUiApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<stream></stream>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the stream directive');
  }));
});
