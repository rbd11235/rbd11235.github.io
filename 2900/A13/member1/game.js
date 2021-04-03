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
		//Indicates the sprite id of the box to the
		// left, right, top, or bottom of the player
		//An empty string means there is no box in that position.
		toLeft: "",
		toRight: "",
		toUp: "",
		toDown: "",
	}
	//Size of the grid, excluding the user interface.
	//UI will adjust to different grid sizes, but it shouldn't be made smaller than 4x4
	const GRIDX = 9
	const GRIDY = 8

	// Here a counter is formed to measure the amount of times a
	// particular bead has been touched by the player block.
	const Square=[];
	for (var a=0; a<GRIDX; a++)  {
		for (var b=0; b<GRIDY; b++)  {
			Square.push({positionX:a,positionY:b,Counter:0});
		}
	}

	//Amount of boxes to spawn.
	//Should be kept at 1 unless collisions for multiple boxes are implemented
	const BOXES = 1

	//These functions are called when the UI buttons are clicked.
	//Acts as if they pressed one of arrow keys
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

	//Called when the player touches another box.
	//Updates player values to indicate there is now a box next to the player.
	var collisionFunc = function ( s1, p1, s2, p2, type ) {

		if ( type === PS.SPRITE_TOUCH ) {
			type = " touched "
			//Position of the player
			var s1Pos = PS.spriteMove(s1, PS.CURRENT, PS.CURRENT);

			//Position of the box it's touching
			var s2Pos = PS.spriteMove(s2, PS.CURRENT, PS.CURRENT);

			//Values used to detect box's position relative to the player
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
	};

	//Updates the position of the player on the grid based on the values of the player object
	function updatePosition()
	{
		// Set plane to 1 (above floor)

		PS.spritePlane( player.spriteId, 1 );

		// Position sprite at center of grid

		PS.spriteMove( player.spriteId, player.x, player.y );
		// Here it is determined if a square has been touched by the player bead more than 5 times
		// and if so it sets the square color to brown
		for(var i=0;i<Square.length;i++){
			if (Square[i].positionX==player.x&&Square[i].positionY==player.y){
				Square[i].Counter++;
				if (Square[i].Counter>=5){
					PS.color(player.x,player.y, 0x552628)
				}
			}
		}

	};

	//Adds the fence to the grid.
	function addBorder()
	{
		//For the top and bottom of fence
		for(var x=2; x < (GRIDX - 2); x++)
		{
			let topWidth = {
				top : 5,
				left : 1,
				bottom : 1,
				right : 1
			};
			let bottomWidth = {
				top : 1,
				left : 1,
				bottom : 5,
				right : 1
			};
			PS.border(x, 1, topWidth);
			PS.border(x, GRIDY - 2, bottomWidth);
		}

		//For the left and right of fence
		for(var y=2; y < (GRIDY - 2); y++)
		{
			let leftWidth = {
				top : 1,
				left : 5,
				bottom : 1,
				right : 1
			};
			let rightWidth = {
				top : 1,
				left : 1,
				bottom : 1,
				right : 5
			};
			PS.border(1, y, leftWidth);
			PS.border(GRIDX - 2, y, rightWidth);
		}

		//For the border separating the game and the user interface
		for(var x=0; x < GRIDX; x++)
		{
			let width = {
				top : 5,
				left : 1,
				bottom : 1,
				right : 1
			};
			PS.border(x, GRIDY, width);
		}

		//For the corners of the fence
		let corner1 = {
			top : 5,
			left : 5,
			bottom : 1,
			right : 1
		}

		let corner2 = {
			top : 5,
			left : 1,
			bottom : 1,
			right : 5
		}

		let corner3 = {
			top : 1,
			left : 1,
			bottom : 5,
			right : 5
		}

		let corner4 = {
			top : 1,
			left : 5,
			bottom : 5,
			right : 1
		}

		PS.border(1, 1, corner1);
		PS.border(GRIDX - 2, 1, corner2);
		PS.border(GRIDX - 2, GRIDY - 2, corner3);
		PS.border(1, GRIDY - 2, corner4);
	}

	//Creates the user interface and hooks up the buttons to the click methods
	//Will center the UI horizontally based on the grid size
	function addUI()
	{
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
	}
	var exports = {
		init: function( system, options ) {
			PS.statusText("Team Swift")
			//Adds 2 rows to the bottom for the user interface.
			PS.gridSize( GRIDX, GRIDY + 2 );
			//Here the grid and backgrounds are set to green
			for (var a=0; a<GRIDX; a++)  {
				for (var b=0; b<GRIDY; b++)  {
					PS.color(a,b,0x4eb63d)
				}
			}
			PS.gridColor(0x4eb63d)


			addBorder();
			addUI();
			// Change this string to your team name
			// Use only ALPHABETIC characters
			// No numbers, spaces or punctuation!
			player.spriteId = PS.spriteSolid( 1, 1 );

			// Set color to red

			PS.spriteSolidColor( player.spriteId, PS.COLOR_RED );
			PS.spriteCollide(player.spriteId, collisionFunc)

			const TEAM = "TeamSwift";


			//Spawns boxes in a diagonal line.
			for(var i=0; i < BOXES; i++)
			{
				var block =
					{
						sprite: PS.spriteSolid(1, 1),
						x: (1 + i),
						y: (1 + i)
					}
				PS.spriteSolidColor( block.sprite, PS.COLOR_BLACK);
				PS.spritePlane( block.sprite, 1 );
				PS.spriteMove(block.sprite, block.x, block.y);
			}
			//Spawns the player
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
			var didMove = true;

			//If up or W
			//The reset of these methods behave similarly
			if(key === 1006 || key === 119)
			{
				//If they're not trying to move offscreen
				if(player.y > 0) {
					//If there is a box above them
					if(player.toUp !== "")
					{
						//If they're trying to push the box out of the fence
						if(player.y == 2)
						{
							didMove = false;
						}
						//If the box is movable, move the player and box. Play sound effect
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
			//If left or A
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
			//If right or D
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
			//If down or S
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
			//Reset collision data
			if(didMove)
			{
				player.toDown = "";
				player.toUp = "";
				player.toLeft = "";
				player.toRight = "";
			}
			//If trying to push box outside the fence, play sound effect
			else
			{
				PS.audioPlay( "fx_squink" );
			}

			//Move the player. Only here will collisions with new boxes trigger and properly update the player data.
			updatePosition();

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
