var DEFAULT_HASH = 'home', url = hasher.getBaseURL();
var apiKey = '6902943f0a9e5a3d4e84475e392ca8e7'; //api key for flickr
//setup crossroads
crossroads.addRoute('home',function(){ flickRandomPull() }); // #/home
crossroads.addRoute('photo/{id}', function(id){ pullSinglePhoto(id) }); // #/photo/{number}
crossroads.routed.add(console.log, console); //log all routes

//setup hasher

hasher.initialized.add(parseHash); //parse initial hash
if (hasher.getURL() === url) {
    hasher.setHash(DEFAULT_HASH);
}

function parseHash(newHash, oldHash){
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
                    $("<img>").attr({
                        src: photoURL,
                        'class': 'center',
                        alt: item.title,
                        title: item.title,
                        id: 'animal-image'
                    }).appendTo("#image");
                    $('#text').html(
                        '<h2>' + item.title + '</h2>' +
                        '<a href="http://www.flickr.com/photos/' + item.owner + '/' + item.id +'"> Link to Original image on Flikr</a> <br>' +
                        '<a href="#/photo/' + item.id +'">Permalink</a>'
                    );
                    $('#background-image').css({
                        'background-image': 'url(' + photoURL + ')'
                    });
                    hasher.setHash('photo/' + item.id);
                    $('.loading').hide(400);
                    return false;
                }
            });
        });
}

function pullSinglePhoto(photoID) {
    document.title = photoID + ' is a Random Animal';
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key='+ apiKey +'&format=json&nojsoncallback=1&photo_id=' + photoID,
        function (data) {
            $.each(data.sizes.size, function (i, item) {

                if (item.label === "Medium 640" ) {
                    //var photoDimension = 'z';
                    //var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_' + photoDimension + '.jpg';
                    var photoURL = item.source;
                    $("<img>").attr({
                        src: photoURL,
                        'class': 'center',
                        alt: item.title,
                        title: item.title,
                        id: 'animal-image'
                    }).appendTo("#image");
                    $('#text').html(
                        '<h2>' + item.title + '</h2>' +
                        '<a href="http://www.flickr.com/photos/' + item.owner + '/' + item.id +'"> Link to Original image on Flikr</a> <br>' +
                        '<a href="#/photo/' + item.id +'">Permalink</a>'
                    );
                    $('.loading').hide(400);
                    $('#background-image').css({
                        'background-image': 'url(' + photoURL + ')'
                    });
                    return false;
                }
            });
        });
}


function reload() {
    $('.loading').show(250);
    $('#image').text('');
    $('#text').text('');
    hasher.setHash('home');
}

function showAbout(){

}
