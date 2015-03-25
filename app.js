var DEFAULT_HASH = 'random';                                    //define the default hash of the site
var url = hasher.getBaseURL();                                  //get the domain url
var apiKey = '6902943f0a9e5a3d4e84475e392ca8e7';                //api key for flickr

//setup crossroads
crossroads.addRoute('random', function () {                     // #/random
    flickRandomChooser();                                       //invoke the method
});
crossroads.addRoute('{animal}/{id}', function (animal, id) {    // #/cat/4951178109
    pullSinglePhoto(animal, id)                                 //invoke the method
});
//crossroads.routed.add(console.log, console);                  //log all routes

//setup hasher
hasher.initialized.add(parseHash);                              //parse initial hash
if (hasher.getURL() === url) {
    hasher.setHash(DEFAULT_HASH);
}

function parseHash(newHash, oldHash) {
    // second parameter of crossroads.parse() is the "defaultArguments" and should be an array
    // so we ignore the "oldHash" argument to avoid issues.
    crossroads.parse(newHash);
}

hasher.changed.add(parseHash);                                  //parse hash changes
hasher.init();                                                  //start listening for hash changes

function getRandomInt(min, max) {                               //see MDN for info
    return Math.floor(Math.random() * (max - min)) + min;       //@url http://goo.gl/tjFMIA
}

function flickRandomChooser() {
    var animalChoices = ['owl', 'otter', 'alpaca', 'frog', 'cat'];
    var animalSearch = animalChoices[getRandomInt(0, animalChoices.length)];  //extract the random animal to search
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&sort=relevance&text=' + animalSearch,
        function (data) {
            var randInt = getRandomInt(0, data.photos.perpage); //maximum value from the api
            $.each(data.photos.photo, function (i, item) {      //search the result

                if (i === randInt) {                            //find the selected row
                    hasher.replaceHash(animalSearch + '/' + item.id); //replacing the URL triggers pullSinglePhoto
                    return false;                               //exit
                }
            });
        });
}

function pullSinglePhoto(animal, photoID) {
    document.title = animal[0].toUpperCase() + animal.slice(1) + ' is a Random Animal'; //set the tile with the first letter uppercase
    $("#favicon").attr('href', 'icons/' + animal + '.png');     //set the favicon using png in icons/
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + apiKey + '&photo_id=' + photoID + '&format=json&nojsoncallback=1',
        function (item) {
            var photoDimension = 'z';                           //calculate the url for the photo @url http://goo.gl/1zRIE2
            var photoURL = 'http://farm' + item.photo.farm + '.static.flickr.com/' + item.photo.server + '/' + item.photo.id + '_' + item.photo.secret + '_' + photoDimension + '.jpg';
            outputHTML(photoURL, item.photo.title._content, item.photo.owner.nsid, photoID, animal);
            return false;

        });
}

function outputHTML(photoURL, title, owner, id, animal) {
    $("<img>").attr({                                           //write the <img> attributes
        src: photoURL,
        'class': 'center',
        alt: animal + ' is a Random Animal',
        title: title,
        id: 'animal-image'
    }).appendTo("#image");
    $('#text').html(                                            //write the textbox
        '<h2>' + title + '</h2>' +
        '<a href="http://www.flickr.com/photos/' + owner + '/' + id + '" target="_blank"> Original on Flikr</a> - ' +
        '<a href="#/' + animal + '/' + id + '">Permalink</a>'
    );
    $('#background-image').css({
        'background-image': 'url(' + photoURL + ')'             //set the background image
    });
    $('.loading').hide(400);                                    //hide the loading gif
}


function reload() {
    $('.loading').show(250);                                    //display the loading gif
    $('#image').text('');                                       //erase the image
    $('#text').text('');                                        //erase the text
    hasher.setHash('random');                                   //replacing the url
}

function showAbout() {
    //TODO add about

}
