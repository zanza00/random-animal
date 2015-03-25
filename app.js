var DEFAULT_HASH = 'random', url = hasher.getBaseURL();
var apiKey = '6902943f0a9e5a3d4e84475e392ca8e7'; //api key for flickr

//setup crossroads
crossroads.addRoute('random', function () {                     // #/random
    flickRandomPull()
});
crossroads.addRoute('p/{animal}/{id}', function (animal, id) {  // #/p/cat/4951178109
    pullSinglePhoto(animal, id)
});
crossroads.routed.add(console.log, console); //log all routes

//setup hasher

hasher.initialized.add(parseHash); //parse initial hash
if (hasher.getURL() === url) {
    hasher.setHash(DEFAULT_HASH);
}

function parseHash(newHash, oldHash) {
    // second parameter of crossroads.parse() is the "defaultArguments" and should be an array
    // so we ignore the "oldHash" argument to avoid issues.
    crossroads.parse(newHash);
}

hasher.changed.add(parseHash); //parse hash changes
hasher.init(); //start listening for hash changes

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function flickRandomPull() {
    console.log('flickRandomPull()');
    var animalChoices = ['owl', 'otter', 'alpaca', 'frog', 'cat'];
    var animalSearch = animalChoices[getRandomInt(0, animalChoices.length)];
    document.title = animalSearch[0].toUpperCase() + animalSearch.slice(1) + ' is a Random Animal';
    $("#favicon").attr('href', 'icons/' + animalSearch + '.png');
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&sort=relevance&text=' + animalSearch,
        function (data) {
            var randInt = getRandomInt(0, data.photos.perpage);
            $.each(data.photos.photo, function (i, item) {

                if (i === randInt) {
                    var photoDimension = 'z';
                    var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_' + photoDimension + '.jpg';
                    pullSinglePhoto(animalSearch, item.id);
                    return false;
                }
            });
        });
}

function pullSinglePhoto(animal, photoID) {
    console.log('pullSinglePhoto()');
    document.title = photoID + ' is a Random Animal';
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + apiKey + '&format=json&nojsoncallback=1&photo_id=' + photoID,
        function (data) {
            $.each(data.sizes.size, function (i, item) {

                if (item.label === "Medium 640") {
                    var photoURL = item.source;
                    outputHTML(photoURL, 'TITLE', 'OWNER', photoID, animal);
                    return false;
                }
            });
        });
}

function outputHTML(photoURL, title, owner, id, animal) {
    console.log('outputHTML');
    $("<img>").attr({
        src: photoURL,
        'class': 'center',
        alt: 'this is a ' + animal,
        title: title,
        id: 'animal-image'
    }).appendTo("#image");
    $('#text').html(
        '<h2>' + title + '</h2>' +
        '<a href="http://www.flickr.com/photos/' + owner + '/' + id + '"> Link to Original image on Flikr</a> <br>' +
        '<a href="#/p/' + animal + '/' + id + '">Permalink</a>'
    );
    $('#background-image').css({
        'background-image': 'url(' + photoURL + ')'
    });
    console.log(hasher.getHash());
    if (hasher.getHash() === 'random') {
        console.log('changed hash');
        hasher.replaceHash('p/' + animal + '/' + id);
    }
    $('.loading').hide(400);
}


function reload() {
    $('.loading').show(250);
    $('#image').text('');
    $('#text').text('');
    hasher.setHash('random');
}

function showAbout() {
    //TODO add about

}
