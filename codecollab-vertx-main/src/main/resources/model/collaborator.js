module.exports = function(name, sock, isPresenter, color) {
    var name        = name;
    var sock        = sock;
    var isPresenter = isPresenter;
    var color       = color;

    this.getName = function() {
        return name;
    };

    this.getSock = function() {
        return sock;
    };

    this.isPresenter = function() {
        return isPresenter;
    };

    this.getColor = function() {
        return color;
    };
};
