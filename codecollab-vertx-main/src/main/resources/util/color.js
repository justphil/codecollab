module.exports = {
    generateColor: function(collaboratorCount) {
        var color;

        if (collaboratorCount === 0) {
            color = '#d70a4b';
        }
        else if (collaboratorCount === 1) {
            color = '#baf84b';
        }
        else if (collaboratorCount === 2) {
            color = '#305f8a';
        }
        else if (collaboratorCount === 3) {
            color = '#f8e497';
        }
        else if (collaboratorCount === 4) {
            color = '#17c449';
        }
        else if (collaboratorCount === 5) {
            color = '#d3b80e';
        }
        else if (collaboratorCount === 6) {
            color = '#538a52';
        }
        else if (collaboratorCount === 7) {
            color = '#e7fd02';
        }
        else if (collaboratorCount === 8) {
            color = '#e230c2';
        }
        else if (collaboratorCount === 9) {
            color = '#c27d6f';
        }
        else {
            color = '#' + (0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        }

        return color;
    }
};
