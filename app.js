var DEFAULT_HASH = 'random';                                    //define the default hash for the site #/random
var url = hasher.getBaseURL();                                  //get the base url for
var apiKey = '6902943f0a9e5a3d4e84475e392ca8e7';                //api key for flickr
var animalChoices = ['owl', 'otter', 'alpaca', 'frog', 'cat'];  //array with the animal choices

/*
 * Adding the various hash to watch
 */
crossroads.addRoute('random', function () {                     // #/random
    $('.loading').show(250);                                    //display the loading gif for when the page reloads
    flickRandomAnimalChooser();                                 //invoke the method
});
crossroads.addRoute('about', function () {                      // #/about
    showAbout();
});
crossroads.addRoute('{word}/{id}', function (word, id) {        // #/first-part/second-part
    if (animalChoices.indexOf(word) != -1) {                    //check if the first part is in the animal array
        prepareAnimalPage(word, id);                            //animal is OK #/cat/4951178109
    } else {
        switch (word) {                                         //check what is the first
            case 'photo':                                       //first part is photo #/photo/15870245063
                preparePhotoPage(id);
                break;
            case 'unknown':                                     //hash for wrong command, with this case
                break;                                          //it doesn't trigger the default behavior
            default :
                prepareErrorPage(word);
        }
    }
});
//crossroads.routed.add(console.log, console);                  //log all routes

/*
 *Setup #hasher
 */
hasher.initialized.add(parseHash);                              //parse initial hash
if (hasher.getURL() === url) {                                  //if base url is the current url
    hasher.setHash(DEFAULT_HASH);                               //append the default hash #/random
}

/*
 * second parameter of crossroads.parse() is the "defaultArguments" and should be an array
 * so we ignore the "oldHash" argument to avoid issues.
 */
function parseHash(newHash, oldHash) {
    crossroads.parse(newHash);
}

hasher.changed.add(parseHash);                                  //parse hash changes
hasher.init();                                                  //start listening for hash changes


/*
 * Return a random int See MDN for info @url http://goo.gl/tjFMIA
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


/*
 * Choose a random species from the array and change the hash to #/{animal}/{id}
 */
function flickRandomAnimalChooser() {
    var animalSearch = animalChoices[getRandomInt(0, animalChoices.length)];  //extract the random animal to search
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + apiKey +
        '&format=json&nojsoncallback=1&sort=relevance&text=' + animalSearch,  //API call
        function (data) {
            var randInt = getRandomInt(0, data.photos.perpage); //maximum value from the api
            $.each(data.photos.photo, function (i, item) {      //search the result
                if (i === randInt) {                            //find the selected row
                    hasher.replaceHash(animalSearch + '/' + item.id);  //replacing the URL triggers prepareAnimalPage
                    return false;                               //exit
                }
            });
        });
}


/*
 * Prepare the page for a valid animal
 */
function prepareAnimalPage(animal, photoID) {
    document.title = animal[0].toUpperCase() + animal.slice(1) + ' is a Random Animal'; //set the title with the first letter uppercase
    $("#favicon").attr('href', 'icons/' + animal + '.png');     //set the favicon using png in icons/
    $('#reload-link').text('Another Animal!');                  //change the random link text
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + apiKey + '&photo_id=' + photoID + '&format=json&nojsoncallback=1',
        function (item) {
            var photoDimension = 'z';                           //calculate the url for the photo @url http://goo.gl/1zRIE2
            var photoURL = 'http://farm' + item.photo.farm + '.static.flickr.com/' + item.photo.server + '/' + item.photo.id + '_' + item.photo.secret + '_' + photoDimension + '.jpg';
            printImage(photoURL, item.photo.title._content, item.photo.owner.nsid, photoID, animal + ' is a Random Animal', animal);
            return false;
        });

}


/*
 * Prepare the page for a valid photo
 */
function preparePhotoPage(photoID) {
    document.title = 'flickr image';                            //set title to generic photo
    $("#favicon").attr('href', 'icons/photo.png');              //set the favicon using generic image
    $('#reload-link').text('I Want a Random Animal!');          //change the random link text
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + apiKey + '&photo_id=' + photoID + '&format=json&nojsoncallback=1',
        function (item) {
            var photoDimension = 'z';                           //calculate the url for the photo @url http://goo.gl/1zRIE2
            var photoURL = 'http://farm' + item.photo.farm + '.static.flickr.com/' + item.photo.server + '/' + item.photo.id + '_' + item.photo.secret + '_' + photoDimension + '.jpg';
            printImage(photoURL, item.photo.title._content, item.photo.owner.nsid, photoID, 'This is not an Animal (maybe)', 'photo');
            return false;
        });
}


/*
 * Prepare the page for a valid error
 */
function prepareErrorPage(wrongThing) {
    document.title = 'I don\'t know ' + wrongThing;             //set title to malformed word
    $("#favicon").attr('href', 'icons/photo.png');              //set the favicon using generic image
    $('#reload-link').text('I Want a Random Animal!');          //change the random link text
    hasher.replaceHash('unknown/command');
    var photoURL = 'http://farm5.static.flickr.com/4114/4893865426_ace835cfca_z.jpg';
    printImage(photoURL, 'what is ' + wrongThing + '?', '29316666@N06', '4893865426', 'Something went wrong, enjoy this mountain', 'photo');
    return false;
}


/*
 * Show the special page for about
 */
function showAbout() {
    document.title = 'About Page';                              //set title about
    $("#favicon").attr('href', 'icons/favicon.png');            //set the favicon using about icons
    $('#reload-link').text('I Want a Random Animal!');          //change the random link text
    var photoURL = 'http://farm9.static.flickr.com/8598/15870245063_2ab1004ff2_z.jpg';
    printImage(photoURL, 'fetching', '29316666@N06', '15870245063', 'fetching', 'about');
    $('#text').load('about.html');                              //load the html of the file about
    $('.loading').hide(400);                                    //hide the loading gif
}


/*
 * Actual insert of the image, background, title and link to original photo
 */
function printImage(photoURL, imgTitle, owner, id, imgMouse, word) {  //write the HTML for the #image and #text
    var textCached = $('#text');                                //cache the #text div for performance
    $('#image').text('');                                       //erase the image
    textCached.text('');                                        //erase the text
    $("<img>").attr({                                           //write the <img> attributes
        src: photoURL,
        'class': 'center',
        alt: imgTitle,
        title: imgMouse,                                        //mouseover
        id: 'animal-image'
    }).appendTo("#image");
    textCached.html(                                            //write the textbox
        '<h2>' + imgTitle + '</h2>' +
        '<a href="http://www.flickr.com/photos/' + owner + '/' + id + '" target="_blank"> Original on Flikr</a> - ' +
        '<a href="#/' + word + '/' + id + '">Permalink</a>'
    );
    $('#background-image').css({
        'background-image': 'url(' + photoURL + ')'             //set the image as background
    });
    $('.loading').hide(400);                                    //hide the loading gif
}
