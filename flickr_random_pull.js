function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function flickrPull() {
    var animalChoices = ['owl', 'otter', 'alpaca', 'frog', 'cat'];
    var animalSearch = animalChoices[getRandomInt(0, animalChoices.length)];
    //cambio il titolo della pagina, mettendo il nome dell'animale con la prima lettera maiuscola
    document.title = animalSearch[0].toUpperCase() + animalSearch.slice(1) + ' Flikr Demo';
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6902943f0a9e5a3d4e84475e392ca8e7&format=json&nojsoncallback=1&sort=relevance&text=' + animalSearch,
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
                    //$('<a>').attr({
                    //    href: "http://www.flickr.com/photos/" + item.owner + "/" + item.id,
                    //    id: 'link-text'
                    //}).appendTo('#text');
                    $('#text').html(
                        '<h2>' + item.title + '</h2>' +
                        '<a href="http://www.flickr.com/photos/' + item.owner + '/' + item.id +'"> Link to Original image on Flikr</a>'
                    );
                    $('a#link-text').text('Link to original photo on Flickr');
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
    flickrPull()
}


$(function () {
    flickrPull();
});
