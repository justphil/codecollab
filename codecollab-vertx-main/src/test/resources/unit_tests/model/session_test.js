var Session     = require('model/session');
var vassert     = require("vertx_assert");
var vertxTests  = require("vertx_tests");

function testCreateSession() {
    var sess = new Session('123', true, 'an/ace/theme', 'an/ace/mode');
    vassert.assertEquals('Session ids must match.', '123', sess.getSessionId());
    vassert.assertEquals('allowEditing must be true.', true, sess.getAllowEditing());
    vassert.assertEquals('Ace themes must match.', 'an/ace/theme', sess.getAceTheme());
    vassert.assertEquals('Ace modes must match.', 'an/ace/mode', sess.getAceMode());

    vassert.testComplete();
}

function testAddAndRemoveCollaborator() {
    var sess = new Session('123', true, 'an/ace/theme', 'an/ace/mode');
    var collaborator = {getName: function() {
        return 'test';
    }};
    sess.addCollaborator('1', collaborator);

    vassert.assertSame(
        'Session should return the just added collaborator.', collaborator, sess.getCollaboratorBySockId('1')
    );
    vassert.assertTrue('Session should contain one collaborator.', 1 === sess.getCollaboratorSize());
    vassert.assertTrue('Session should contain a collaborator "test".', sess.isCollaboratorWithName('test'));

    sess.removeCollaborator('1');
    vassert.assertNull(
        'Session shouldn\'t return the removed collaborator anymore.', sess.getCollaboratorBySockId('1')
    );
    vassert.assertTrue('Session shouldn\'t contain collaborators anymore.', 0 === sess.getCollaboratorSize());
    vassert.assertFalse(
        'Session shouldn\'t contain a collaborator "test" anymore.', sess.isCollaboratorWithName('test')
    );

    vassert.testComplete();
}

vertxTests.startTests(this);
