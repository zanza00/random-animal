var DEFAULT_HASH = 'home', url = hasher.getBaseURL();

//setup crossroads
crossroads.addRoute('home');

crossroads.addRoute('lorem');
crossroads.addRoute('lorem/ipsum');
crossroads.addRoute('photo/{id}', function(id){
    $('#result').text('photo #: ' + id);
});
crossroads.routed.add(console.log, console); //log all routes
crossroads.parse('photo/');

//setup hasher

//only required if you want to set a default value
//if(! hasher.getHash()){
//    hasher.setHash(DEFAULT_HASH);
//}
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
