module.exports = {
    DEFAULT_PORT    : 8080,
    SOCK_ID_KEY     : 'writeHandlerID',
    SOCKJS_PREFIX   : '/ccsess',
    PROTOCOL : {
        MSG_TYPE_JOIN           : 'join',
        MSG_TYPE_JOINED         : 'joined',
        MSG_TYPE_USER_JOINED    : 'userJoined',
        MSG_TYPE_JOIN_FAILED    : 'joinFailed',
        MSG_TYPE_LEFT           : 'left',
        MSG_TYPE_OVER           : 'over',
        MSG_TYPE_STREAM_MESSAGE : 'stream_message',
        MSG_TYPE_CODE_REQUESTED : 'codeRequested',
        MSG_TYPE_CODE_SNAPSHOT  : 'codeSnapshot',
        MSG_TYPE_INSERT_TEXT    : 'insertText',
        MSG_TYPE_INSERT_LINES   : 'insertLines',
        MSG_TYPE_REMOVE_TEXT    : 'removeText',
        MSG_TYPE_REMOVE_LINES   : 'removeLines',
        MSG_TYPE_CHANGE_CURSOR  : 'changeCursor',
        MSG_TYPE_CHANGE_SELECTION  : 'changeSelection'
    }
};