var container   = require("container");
var console     = require("console");
var vertxTests  = require("vertx_tests");
var vassert     = require("vertx_assert");

// The test methods must begin with "test"

function test_1() {
    vassert.testComplete();
}

function test_2() {
    vassert.assertEquals("foo", "foo");
    console.log('vertx.modulename -> ' + java.lang.System.getProperty("vertx.modulename"));
    vassert.testComplete();
}

var script = this;
container.deployModule(java.lang.System.getProperty("vertx.modulename"), function (err, depID) {
    vassert.assertNull("err is not null", err);
    vertxTests.startTests(script);
});
