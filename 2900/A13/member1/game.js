/*
game.js for Perlenspiel 3.3.x
Last revision: 2021-03-24 (BM)

The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

var player = {
	id: "",
	x: 0,
	y: 0,
	toLeft: "",
	toRight: "",
	toUp: "",
	toDown: "",
}

var blocks = [];

const GRIDX = 9
const GRIDY = 8


PS.init = function( system, options ) {
	PS.statusText("Team Swift")
	PS.gridSize( GRIDX, GRIDY + 2 ); // or whatever size you want
	for(var x=2; x < (GRIDX - 2); x++)
	{
		let w1 = {
			top : 5,
			left : 1,
			bottom : 1,
			right : 1
		};
		let w2 = {
			top : 1,
			left : 1,
			bottom : 5,
			right : 1
		};
		PS.border(x, 1, w1);
		PS.border(x, GRIDY - 2, w2);
	}

	for(var y=2; y < (GRIDY - 2); y++)
	{
		let w1 = {
			top : 1,
			left : 5,
			bottom : 1,
			right : 1
		};
		let w2 = {
			top : 1,
			left : 1,
			bottom : 1,
			right : 5
		};
		PS.border(1, y, w1);
		PS.border(GRIDX - 2, y, w2);
	}

	for(var x=0; x < GRIDX; x++)
	{
		let w1 = {
			top : 5,
			left : 1,
			bottom : 1,
			right : 1
		};
		PS.border(x, GRIDY, w1);
	}

	let c1 = {
		top : 5,
		left : 5,
		bottom : 1,
		right : 1
	}

	let c2 = {
		top : 5,
		left : 1,
		bottom : 1,
		right : 5
	}

	let c3 = {
		top : 1,
		left : 1,
		bottom : 5,
		right : 5
	}

	let c4 = {
		top : 1,
		left : 5,
		bottom : 5,
		right : 1
	}

	PS.border(1, 1, c1);
	PS.border(GRIDX - 2, 1, c2);
	PS.border(GRIDX - 2, GRIDY - 2, c3);
	PS.border(1, GRIDY - 2, c4);

	let upX = GRIDX/2;
	let upY = GRIDY;
	let downX = GRIDX/2;
	let downY = GRIDY + 1;
	let leftX = (GRIDX/2) - 1;
	let leftY = GRIDY + 1;
	let rightX = (GRIDX/2) + 1;
	let rightY = GRIDY + 1;

	PS.glyph(upX, upY, "^");
	PS.glyph(downX, downY, "v");
	PS.glyph(leftX, leftY, "<");
	PS.glyph(rightX, rightY, ">");
	PS.exec(upX, upY, clickedUp)
	PS.exec(downX, downY, clickedDown)
	PS.exec(leftX, leftY, clickedLeft)
	PS.exec(rightX, rightY, clickedRight)
	// Change this string to your team name
	// Use only ALPHABETIC characters
	// No numbers, spaces or punctuation!
	player.id = PS.spriteSolid( 1, 1 );

	// Set color to red

	PS.spriteSolidColor( player.id, PS.COLOR_RED );
	PS.spriteCollide(player.id, collisionFunc)

	const TEAM = "TeamSwift";

	// Begin with essential setup
	// Establish initial grid size
	for(var i=0; i < 1; i++)
	{
		var block =
			{
				sprite: PS.spriteSolid(1, 1),
				x: (2 + i),
				y: (2 + i)
			}
		PS.spriteSolidColor( block.sprite, PS.COLOR_BLACK);
		PS.spritePlane( block.sprite, 1 );
		PS.spriteMove(block.sprite, block.x, block.y);
		blocks.push(block);
	}


	updatePosition();


	// Install additional initialization code
	// here as needed

	// PS.dbLogin() must be called at the END
	// of the PS.init() event handler (as shown)
	// DO NOT MODIFY THIS FUNCTION CALL
	// except as instructed

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
       if ( user === PS.ERROR ) {
          return PS.dbErase( TEAM );
       }
       PS.dbEvent( TEAM, "startup", user );
       PS.dbSave( TEAM, PS.CURRENT, { discard : true } );
    }, { active : true } );
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );


	// Decide what the next color should be.
	// If the current value was black, change it to white.
	// Otherwise change it to black.



	// NOTE: The above statement could be expressed more succinctly using JavaScript's ternary operator:
	// let next = ( data === PS.COLOR_BLACK ) ? PS.COLOR_WHITE : PS.COLOR_BLACK;

	// Remember the newly-changed color by storing it in the bead's data.

	// Add code here for mouse clicks/touches
	// over a bead
};

var collisionFunc = function ( s1, p1, s2, p2, type ) {

	if ( type === PS.SPRITE_TOUCH ) {
		type = " touched "
		var s1Pos = PS.spriteMove(s1, PS.CURRENT, PS.CURRENT);

		var s2Pos = PS.spriteMove(s2, PS.CURRENT, PS.CURRENT);
		let diffX = s2Pos.x - s1Pos.x;
		let diffY = s2Pos.y - s1Pos.y;
		if(diffX == 1 && diffY == 0)
		{
			player.toRight = s2;
		}
		else if(diffX == -1 && diffY == 0)
		{
			player.toLeft = s2;
		}
		else if(diffY == 1 && diffX == 0)
		{
			player.toDown = s2;
		}
		else if(diffY == -1 && diffX == 0)
		{
			player.toUp = s2;
		}
	}
	else {
		type = " overlapped ";
	}
	//PS.debug( s1 + type + s2 );
};



/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
	//Up
	var didMove = true;
	if(key === 1006 || key === 119)
	{
		if(player.y > 0) {

			if(player.toUp !== "")
			{
				if(player.y == 2)
				{
					didMove = false;
				}
				else
				{
					player.y = player.y - 1
					var boxPos = PS.spriteMove(player.toUp, PS.CURRENT, PS.CURRENT);
					PS.spriteMove(player.toUp, boxPos.x, boxPos.y - 1);
					PS.spriteShow(player.toUp)
					PS.audioPlay( "fx_scratch" );

				}

			}
			else
			{
				player.y = player.y - 1
			}
		}
	}
	//Left
	else if(key === 1005 || key === 97)
	{
		if(player.x > 0) {
			if(player.toLeft !== "")
			{
				if(player.x == 2)
				{
					didMove = false;
				}
				else
				{
					player.x = player.x - 1;
					var boxPos = PS.spriteMove(player.toLeft, PS.CURRENT, PS.CURRENT);
					PS.spriteMove(player.toLeft, boxPos.x - 1, boxPos.y);
					PS.spriteShow(player.toLeft)
					PS.audioPlay( "fx_scratch" );
				}

			}
			else
			{
				player.x = player.x - 1;
			}
		}
	}
	//Right
	else if(key === 1007 || key === 100)
	{
		if(player.x < (GRIDX - 1))
		{

			if(player.toRight !== "")
			{
				if(player.x == (GRIDX - 3))
				{
					didMove = false;
				}
				else
				{
					player.x = player.x + 1;
					var boxPos = PS.spriteMove(player.toRight, PS.CURRENT, PS.CURRENT);
					PS.spriteMove(player.toRight, boxPos.x + 1, boxPos.y);
					PS.spriteShow(player.toRight)
					PS.audioPlay( "fx_scratch" );
				}

			}
			else
			{
				player.x = player.x + 1;
			}
		}

	}
	//Down
	else if(key === 1008 || key === 115)
	{
		if(player.y < (GRIDY - 1))
		{

			if(player.toDown !== "")
			{
				if(player.y == (GRIDY - 3))
				{
					didMove = false;
				}
				else
				{
					player.y = player.y + 1;
					var boxPos = PS.spriteMove(player.toDown, PS.CURRENT, PS.CURRENT);
					PS.spriteMove(player.toDown, boxPos.x, boxPos.y + 1);
					PS.spriteShow(player.toDown)
					PS.audioPlay( "fx_scratch" );
				}
			}
			else
			{
				player.y = player.y + 1;
			}
		}

	}
	if(didMove)
	{
		player.toDown = "";
		player.toUp = "";
		player.toLeft = "";
		player.toRight = "";
	}
	else
	{
		PS.audioPlay( "fx_squink" );
	}

	updatePosition();
	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

	//  var device = sensors.wheel; // check for scroll wheel
	//
	//  if ( device ) {
	//    PS.debug( "PS.input(): " + device + "\n" );
	//  }

	// Add code here for when an input event is detected.
};

/*
PS.shutdown ( options )
Called when the browser window running Perlenspiel is about to close.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: This event is generally needed only by applications utilizing networked telemetry.
*/

PS.shutdown = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

	// Add code here to tidy up when Perlenspiel is about to close.
};

function updatePosition()
{


	// Set plane to 1 (above floor)

	PS.spritePlane( player.id, 1 );

	// Position sprite at center of grid

	PS.spriteMove( player.id, player.x, player.y );

}

var clickedLeft = function( x, y, data ) {
	PS.keyDown(1005, false, false, null)
};

var clickedRight = function( x, y, data ) {
	PS.keyDown(1007, false, false, null)
};

var clickedUp = function( x, y, data ) {
	PS.keyDown(1006, false, false, null)
};

var clickedDown = function( x, y, data ) {
	PS.keyDown(1008, false, false, null)
};





