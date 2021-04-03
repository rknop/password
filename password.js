// **********************************************************************

PW = function()
{
    var self = this;
    var button;

    button = document.getElementById( "generatefourwords" );
    button.addEventListener( "click", function() { self.generateFourWords(); } );

    button = document.getElementById( "generatebarf" );
    button.addEventListener( "click", function() { self.generateBarf(); } );
}


PW.app = "/password.py/";

// **********************************************************************

PW.waitForResponse = function( request )
{
    var type;

    if (request.readyState === 4 && request.status === 200) {
        type = request.getResponseHeader("Content-Type");
        if (type === "application/json")
        {
            return true;
        }
        else
        {
            window.alert("Request didn't return JSON.  Everything is broken.  Panic.");
            return null;
        }
    }
    else if (request.readyState == 4) {
        window.alert("Woah, got back status " + request.status + ".  Everything is broken.  Panic5D.");
        return null;
    }
    else {
        return false;
    }
}

// **********************************************************************

PW.sendHttpRequest = function( appcommand, data, handler )
{
    var req = new XMLHttpRequest();
    req.open( "POST", PW.app + appcommand );
    req.onreadystatechange = function() { PW.catchHttpResponse( req, handler ) };
    req.setRequestHeader( "Content-Type", "application/json" );
    req.send( JSON.stringify( data ) );
}

// **********************************************************************

PW.catchHttpResponse = function( req, handler )
{
    if ( ! PW.waitForResponse( req ) ) return;
    var statedata = JSON.parse( req.responseText );
    if ( statedata.hasOwnProperty( "error" ) ) {
        window.alert( statedata.error );
        return;
    }
    handler( statedata );
}

// ************************************************************

PW.prototype.generateFourWords = function()
{
    var self = this;
    var data = {};
    var elem;

    elem = document.getElementById( "minletters" );
    data.minletters = elem.value;
    elem = document.getElementById( "maxletters" );
    data.maxletters = elem.value;
    elem = document.getElementById( "startcaps" );
    if ( elem.value == "including" )
        data.startcaps = true;
    else
        data.startcaps = false;
    
    PW.sendHttpRequest( "fourwords", data, function( statedata ) {
        self.updatePassword( statedata, "fourwordpassword" );
    } );
}

// **********************************************************************
PW.prototype.generateBarf = function()
{
    var self = this;
    var data = {};
    var elem;

    elem = document.getElementById( "numrandomletters" );
    data.numchars = elem.value;
    elem = document.getElementById( "randomcapitals" );
    data.caps = elem.checked;
    elem = document.getElementById( "randomnumbers" );
    data.numbers = elem.checked;
    elem = document.getElementById( "randomsymbols" );
    data.symbols = elem.checked;
    
    PW.sendHttpRequest( "barf", data, function( statedata ) {
        self.updatePassword( statedata, "barfpassword" );
    } );
}

// **********************************************************************

PW.prototype.updatePassword = function( statedata, divid )
{
    var div, p;
    
    if ( ( ! "password" in statedata ) || ( ! "bits" in statedata ) ) {
        window.alert( "Unexpected response." );
        return;
    }
    div = document.getElementById( divid );
    while ( div.firstChild ) div.removeChild( div.firstChild );
    p = document.createElement( "p" );
    p.style["font-weight"] = "bold";
    div.appendChild( p );
    p.appendChild( document.createTextNode( statedata.password ) );
    p = document.createElement( "p" );
    div.appendChild( p );
    p.appendChild( document.createTextNode( "~" + statedata.bits + " bits of entropy" ) );
    div.style.display = "block";
    div.scrollIntoView();
}

// **********************************************************************
// Wait  for the page to be rendered before running

PW.started = false
PW.init_interval = window.setInterval(
    function()
    {
        var requestdata, renderer
        
        if (document.readyState == "complete")
        {
            if ( !PW.started )
            {
                PW.started = true;
                window.clearInterval( PW.init_interval );
                renderer = new PW();
            }
        }
    },
    100);
