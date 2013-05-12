module.exports = function(name, sock, isPresenter) {
    var name        = name;
    var sock        = sock;
    var isPresenter = isPresenter;

    this.getName = function() {
        return name;
    };

    this.getSock = function() {
        return sock;
    };

    this.isPresenter = function() {
        return isPresenter;
    };
};
