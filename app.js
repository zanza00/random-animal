var DEFAULT_HASH = 'random';                                    //define the default hash of the site
var url = hasher.getBaseURL();                                  //get the domain url
var apiKey = '6902943f0a9e5a3d4e84475e392ca8e7';                //api key for flickr
var animalChoices = ['owl', 'otter', 'alpaca', 'frog', 'cat'];  //array with the animal choices

//setup crossroads
crossroads.addRoute('random', function () {                     // #/random
    $('.loading').show(250);                                    //display the loading gif for when the page reloads
    flickRandomAnimalChooser();                                       //invoke the method
});
crossroads.addRoute('about', function () {                      // #/about
    showAbout();
});
crossroads.addRoute('{word}/{id}', function (word, id) {        // #/cat/4951178109
    if (animalChoices.indexOf(word) != -1) {                    //check if the first word is in the animal array
        preparePageIsAnimal(word, id);                        // animal is OK
    } else {
        switch (word) {
            case 'photo':
                preparePagePhoto(id);
                break;
            default :
                wrongURL(word);
        }
    }
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

function flickRandomAnimalChooser() {
    var animalSearch = animalChoices[getRandomInt(0, animalChoices.length)];  //extract the random animal to search
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey + '&format=json&nojsoncallback=1&sort=relevance&text=' + animalSearch,
        function (data) {
            var randInt = getRandomInt(0, data.photos.perpage); //maximum value from the api
            $.each(data.photos.photo, function (i, item) {      //search the result

                if (i === randInt) {                            //find the selected row
                    hasher.replaceHash(animalSearch + '/' + item.id); //replacing the URL triggers preparePageIsAnimal
                    return false;                               //exit
                }
            });
        });
}

function preparePageIsAnimal(animal, photoID) {
    document.title = animal[0].toUpperCase() + animal.slice(1) + ' is a Random Animal'; //set the tile with the first letter uppercase
    $('#image').text('');                                       //erase the image
    $('#text').text('');                                        //erase the text
    $("#favicon").attr('href', 'icons/' + animal + '.png');     //set the favicon using png in icons/
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + apiKey + '&photo_id=' + photoID + '&format=json&nojsoncallback=1',
        function (item) {
            var photoDimension = 'z';                           //calculate the url for the photo @url http://goo.gl/1zRIE2
            var photoURL = 'http://farm' + item.photo.farm + '.static.flickr.com/' + item.photo.server + '/' + item.photo.id + '_' + item.photo.secret + '_' + photoDimension + '.jpg';
            outputHTML(photoURL, item.photo.title._content, item.photo.owner.nsid, photoID, animal + ' is a Random Animal',animal);
            return false;
        });

}

function preparePagePhoto(photoID) {
    document.title = 'flickr image';                            //set title to generic photo
    $('#image').text('');                                       //erase the image
    $('#text').text('');                                        //erase the text
    $("#favicon").attr('href', 'icons/photo.png');              //set the favicon using generic image
    $('#reload-link').text('I Want a Random Animal!');          //change the random link text
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + apiKey + '&photo_id=' + photoID + '&format=json&nojsoncallback=1',
        function (item) {
            var photoDimension = 'z';                           //calculate the url for the photo @url http://goo.gl/1zRIE2
            var photoURL = 'http://farm' + item.photo.farm + '.static.flickr.com/' + item.photo.server + '/' + item.photo.id + '_' + item.photo.secret + '_' + photoDimension + '.jpg';
            outputHTML(photoURL, item.photo.title._content, item.photo.owner.nsid, photoID, 'This is not an Animal (maybe)', 'photo');
            return false;
        });
}

function wrongURL(wrongWord) {
    document.title = 'I don\'t know ' + wrongWord;                 //set title to malformed word
    $('#image').text('');                                       //erase the image
    $('#text').text('');                                        //erase the text
    $("#favicon").attr('href', 'icons/photo.png');              //set the favicon using generic image
    $('#reload-link').text('I Want a Random Animal!');          //change the random link text
    var photoURL = 'http://farm5.static.flickr.com/4114/4893865426_ace835cfca_z.jpg';
    outputHTML(photoURL, 'what is ' + wrongWord + '?', '29316666@N06', '4893865426', 'Something went wrong, enjoy this mountain', 'photo');
    return false;


}

function outputHTML(photoURL, imgTitle, owner, id, imgMouse, word) {  //write the HTML for the #image and #text
    $("<img>").attr({                                           //write the <img> attributes
        src: photoURL,
        'class': 'center',
        alt: imgTitle,
        title: imgMouse,                                        //mouseover
        id: 'animal-image'
    }).appendTo("#image");
    $('#text').html(                                            //write the textbox
        '<h2>' + imgTitle + '</h2>' +
        '<a href="http://www.flickr.com/photos/' + owner + '/' + id + '" target="_blank"> Original on Flikr</a> - ' +
        '<a href="#/' + word + '/' + id + '">Permalink</a>'
    );
    $('#background-image').css({
        'background-image': 'url(' + photoURL + ')'             //set the background image
    });
    $('.loading').hide(400);                                    //hide the loading gif
}

function showAbout() {
    //TODO add about
    $('.loading').hide(400);                                    //hide the loading gif
    $('#text').text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam dapibus consequat nisl, vel vestibulum enim bibendum vitae. Vestibulum tempor, sem non tincidunt vehicula, nisl purus feugiat erat, eget tincidunt arcu eros in diam. Morbi facilisis libero quis ligula sodales eleifend. Quisque condimentum blandit auctor. Etiam mattis sed justo nec malesuada. Etiam vel sapien in elit commodo elementum eget nec nibh. Nam vitae felis non sem elementum tincidunt eget vitae urna. Mauris quis diam nisl. Integer sed risus lobortis enim dictum vehicula. Cras vitae erat eu velit aliquet ornare. Donec sapien turpis, aliquam non faucibus quis, malesuada vitae sem. Vestibulum tempor arcu metus, et elementum diam congue ac. Proin dictum tempus diam ac tempus. Maecenas fringilla sapien vitae turpis tincidunt pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
    'Donec id magna tristique, condimentum elit at, viverra ligula. Integer auctor ac sem rutrum gravida. Aliquam posuere blandit sapien. Morbi nec odio dictum, consequat justo ac, congue dolor. Mauris eu convallis magna. Pellentesque non libero scelerisque, varius nisl sit amet, aliquet metus. Aenean maximus convallis purus non dapibus. Maecenas pharetra imperdiet sapien. In elementum magna et mauris rutrum semper. Duis interdum massa nulla, quis facilisis metus porta non. Sed eros ante, sodales a nulla vitae, eleifend placerat nisi. Fusce orci tellus, tristique ut ultricies et, faucibus at mauris.' +
    'Nullam volutpat faucibus mollis. Suspendisse sit amet placerat tellus. Praesent sit amet tellus consectetur, dignissim eros at, facilisis elit. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra nisl erat, eget aliquam nulla gravida nec. Aenean euismod eget risus in placerat. Nam a ligula condimentum, aliquet diam vitae, semper tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin a egestas tellus. In et elementum mi, id mattis ligula. Aliquam consectetur nec magna quis finibus. Suspendisse fringilla sed urna sodales semper.)' +
    'Vestibulum id felis ut felis imperdiet scelerisque id tempus turpis. Phasellus feugiat ultrices lorem ut eleifend. Suspendisse potenti. Nunc efficitur pellentesque aliquam. Etiam condimentum felis iaculis tortor egestas eleifend. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum congue dolor eget magna ultricies, et lacinia lectus sagittis. Curabitur a scelerisque leo. Nulla et enim lacus. Donec at sem sed nibh accumsan lacinia hendrerit at velit. Pellentesque in dapibus purus. Pellentesque ultrices tincidunt mauris, nec commodo sem dapibus in.' +
    'Pellentesque feugiat nisl a elit tempor efficitur. Aliquam sit amet odio facilisis, ullamcorper arcu sit amet, pharetra massa. Nulla vel lacus ante. Nullam mattis commodo iaculis. Fusce id nulla molestie dolor sodales porttitor non non magna. Etiam viverra elit a nunc luctus, id bibendum ante semper. Nam hendrerit quis eros nec convallis. Maecenas sed felis turpis. Maecenas orci ligula, eleifend tempus quam id, posuere pharetra neque. Praesent in turpis sed est tincidunt efficitur. Phasellus elementum pharetra dolor, a consectetur nisl vehicula nec. Nunc fermentum ultricies massa eu dictum. Aenean commodo quis purus ac tempus. ');
}
