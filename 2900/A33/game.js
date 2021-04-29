
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


var G = ( function () {
	//Contains information about the player
	var player = {
		spriteId: "",
		x: 0,
		y: 0,
		mazeX: 0,
		mazeY: 0,
		gameOver: false,
		//Indicates the sprite id of the box to the
		// left, right, top, or bottom of the player
		//An empty string means there is no box in that position.

	}
	//Size of the grid, excluding the user interface.
	//UI will adjust to different grid sizes, but it shouldn't be made smaller than 4x4
	const GRIDX = 16
	const GRIDY = 16

	const MAZEX = 3
	const MAZEY = 2

	const COLOR_RED = 0xFF0000;
	const COLOR_BLUE = 0x0000FF;
	const COLOR_GREEN = 0x00FF00;
	const COLOR_YELLOW = 0xFFFF00;
	const COLOR_BLACK = 0x000000;
	var board = {

		width : 0,
		height : 0,
		pixelSize : 1,
		levels: [],
	};

	//Color of the water and borders represented as RGB Triplets

	const GROUND_COLOR = (0x4B81DC);
	const WALL_COLOR = [255,220,122];
	const PLAYER_COLOR = [255, 0, 0];

	//Updates the position of the player on the grid based on the values of the player object
	function updatePosition()
	{
		PS.spritePlane( player.spriteId, 1 );
		PS.spriteMove( player.spriteId, player.x, player.y );
	};



	function loadMap(mazeX, mazeY, imageFile)
	{
		var mapLoader;

		// Image loading function
		// Called when image loads successfully
		// [data] parameter will contain imageData

		mapLoader = function ( imageData ) {
			var x, y, ptr, color;

			// Report imageData in debugger

			/*PS.debug( "Loaded " + imageData.source +
				":\nid = " + imageData.id +
				"\nwidth = " + imageData.width +
				"\nheight = " + imageData.height +
				"\nformat = " + imageData.pixelSize + "\n" );
*/
			// Extract colors from imageData and
			// assign them to the beads
			let room = [];
			ptr = 0; // init pointer into data array
			for ( y = 0; y < GRIDY; y += 1 ) {
				for ( x = 0; x < GRIDX; x += 1 ) {
					color = imageData.data[ ptr ]; // get color
					switch(color)
					{
						case COLOR_BLUE:
							room.push(2);
							break;
						case COLOR_GREEN:
							room.push(1);
							break;
						case COLOR_YELLOW:
							room.push(3);
							break;
						case COLOR_BLACK:
							room.push(0);
							break;
						case COLOR_RED:
							room.push(4);
							break;
					}
					ptr += 1; // point to next value
				}
			}
			board.levels[mazeY][mazeX] = room;
		};

		PS.imageLoad( imageFile, mapLoader, 1 );
	}

	function drawMap(mazeX, mazeY)
	{
		let room = board.levels[mazeY][mazeX];
		for(var y=0; y<GRIDY; y++)
		{
			for(var x=0; x<GRIDX; x++)
			{

			}
		}
	}


	function checkSquare(squareX, squareY)
	{

		switch(getValue(squareX, squareY))
		{
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
		}
	};

	function getValue(squareX, squareY)
	{
		let value = board.data[(squareY * GRIDX) + squareX];
		return value;
	};

	//Creates the user interface and hooks up the buttons to the click methods
	//Will center the UI horizontally based on the grid size
	function addUI()
	{

	};

	var exports = {
		init: function( system, options ) {

			PS.statusText("Team Swift")
			//Adds 2 rows to the bottom for the user interface.
			PS.gridSize( GRIDX, GRIDY);
			board.width = GRIDX;
			board.height = GRIDY;

			//Here the grid and backgrounds are set to green
			for (var a=0; a<GRIDX; a++)  {
				for (var b=0; b<GRIDY; b++)  {
					PS.color(a,b,GROUND_COLOR)
					//PS.fade(a, b, 1);
				}
			}

			//Initialize a multidimensional array.
			for( var y=0; y<MAZEY; y++) {
				let a = [];
				board.levels.push(a);
				for( var x=0; x<MAZEX; x++) {
					let b = [];
					board.levels[y].push(b);
				}
			}
			//PS.gridColor(WATER_COLOR)
			PS.border(PS.ALL, PS.ALL, 0)


			// Change this string to your team name
			// Use only ALPHABETIC characters
			// No numbers, spaces or punctuation!
			player.spriteId = PS.spriteSolid( 1, 1 );
			player.x = Math.floor(GRIDX/2);
			player.y = Math.floor(GRIDY/2);
			player.mazeX = 1;
			player.mazeY = 1;
			// Set color to red

			PS.spriteSolidColor( player.spriteId, PLAYER_COLOR);
			//PS.spriteCollide(player.spriteId, collisionFunc)
			loadMap(1, 1, "GameLevels/MainHall.bmp");

			updatePosition();

			// PS.dbLogin() must be called at the END
			// of the PS.init() event handler (as shown)
			// DO NOT MODIFY THIS FUNCTION CALL
			// except as instructed

			const TEAM = "TeamSwift";

			// This code should be the last thing
			// called by your PS.init() handler.
			// DO NOT MODIFY IT, except for the change
			// explained in the comment below.

			PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
				if ( user === PS.ERROR ) {
					return;
				}
				PS.dbEvent( TEAM, "startup", user );
				PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
			}, { active : false } );

		},

		/*
		PS.touch ( x, y, data, options )
		Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
		This function doesn't have to do anything. Any value returned is ignored.
		[x : Number] = zero-based x-position (column) of the bead on the grid.
		[y : Number] = zero-based y-position (row) of the bead on the grid.
		[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		touch: function( x, y, data, options ) {

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
		},

		/*
		PS.release ( x, y, data, options )
		Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
		This function doesn't have to do anything. Any value returned is ignored.
		[x : Number] = zero-based x-position (column) of the bead on the grid.
		[y : Number] = zero-based y-position (row) of the bead on the grid.
		[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		release: function( x, y, data, options ) {
			// Uncomment the following code line to inspect x/y parameters:

			// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

			// Add code here for when the mouse button/touch is released over a bead.
		},

		/*
		PS.enter ( x, y, button, data, options )
		Called when the mouse cursor/touch enters bead(x, y).
		This function doesn't have to do anything. Any value returned is ignored.
		[x : Number] = zero-based x-position (column) of the bead on the grid.
		[y : Number] = zero-based y-position (row) of the bead on the grid.
		[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		enter: function( x, y, data, options ) {
			// Uncomment the following code line to inspect x/y parameters:

			// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

			// Add code here for when the mouse cursor/touch enters a bead.
		},

		/*
		PS.exit ( x, y, data, options )
		Called when the mouse cursor/touch exits bead(x, y).
		This function doesn't have to do anything. Any value returned is ignored.
		[x : Number] = zero-based x-position (column) of the bead on the grid.
		[y : Number] = zero-based y-position (row) of the bead on the grid.
		[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		exit: function( x, y, data, options ) {
			// Uncomment the following code line to inspect x/y parameters:

			// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

			// Add code here for when the mouse cursor/touch exits a bead.
		},

		/*
		PS.exitGrid ( options )
		Called when the mouse cursor/touch exits the grid perimeter.
		This function doesn't have to do anything. Any value returned is ignored.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		exitGrid: function( options ) {
			// Uncomment the following code line to verify operation:

			// PS.debug( "PS.exitGrid() called\n" );

			// Add code here for when the mouse cursor/touch moves off the grid.
		},

		/*
		PS.keyDown ( key, shift, ctrl, options )
		Called when a key on the keyboard is pressed.
		This function doesn't have to do anything. Any value returned is ignored.
		[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
		[shift : Boolean] = true if shift key is held down, else false.
		[ctrl : Boolean] = true if control key is held down, else false.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		keyDown: function( key, shift, ctrl, options ) {
			// Uncomment the following code line to inspect first three parameters:

			// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
			//Up


			//Marker is used to determine whether to reset the variables that tell the player they're next to a box
			//The only time you don't want to reset them is if the player didn't move

			//If up or W
			//The reset of these methods behave similarly
			if(!player.gameOver)
			{
				if(key === 1006 || key === 119)
				{
					//If they're not trying to move offscreen
					if(player.y > 0) {
						player.y = player.y - 1;
						//PS.audioPlay("Moving", {path:"./"});
					}
				}

				//If left or A
				else if(key === 1005 || key === 97)
				{
					if(player.x > 0) {
						player.x = player.x - 1;
						//PS.audioPlay("Moving", {path:"./"});
					}
				}
				//If right or D
				else if(key === 1007 || key === 100)
				{
					if(player.x < (GRIDX - 1))
					{
						player.x = player.x + 1;
						//PS.audioPlay("Moving", {path:"./"});
					}

				}
				//If down or S
				else if(key === 1008 || key === 115)
				{
					if(player.y < (GRIDY - 1))
					{
						player.y = player.y + 1;
						//PS.audioPlay("Moving", {path:"./"});
					}

				}

				//Move the player. Only here will collisions with new boxes trigger and properly update the player data.
				updatePosition();
			}




		},
		/*
		PS.keyUp ( key, shift, ctrl, options )
		Called when a key on the keyboard is released.
		This function doesn't have to do anything. Any value returned is ignored.
		[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
		[shift : Boolean] = true if shift key is held down, else false.
		[ctrl : Boolean] = true if control key is held down, else false.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		*/

		keyUp: function( key, shift, ctrl, options ) {
			// Uncomment the following code line to inspect first three parameters:

			// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

			// Add code here for when a key is released.
		},

		/*
		PS.input ( sensors, options )
		Called when a supported input device event (other than those above) is detected.
		This function doesn't have to do anything. Any value returned is ignored.
		[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
		*/

		input: function( sensors, options ) {
			// Uncomment the following code lines to inspect first parameter:

			//  var device = sensors.wheel; // check for scroll wheel
			//
			//  if ( device ) {
			//    PS.debug( "PS.input(): " + device + "\n" );
			//  }

			// Add code here for when an input event is detected.
		},

		/*
		PS.shutdown ( options )
		Called when the browser window running Perlenspiel is about to close.
		This function doesn't have to do anything. Any value returned is ignored.
		[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
		NOTE: This event is generally needed only by applications utilizing networked telemetry.
		*/

		shutdown: function( options ) {
			// Uncomment the following code line to verify operation:

			// PS.debug( "“Dave. My mind is going. I can feel it.”\n" );

			// Add code here to tidy up when Perlenspiel is about to close.
		}
	};
	return exports;
} ());

PS.init = G.init;

PS.touch = G.touch;

PS.release = G.release;

PS.enter = G.enter;

PS.exit = G.exit;

PS.exitGrid = G.exitGrid;

PS.keyDown = G.keyDown;

PS.keyUp = G.keyUp;

PS.input = G.input;

PS.shutdown = G.shutdown;
