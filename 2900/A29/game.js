
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
		gameOver: false,
		//Indicates the sprite id of the box to the
		// left, right, top, or bottom of the player
		//An empty string means there is no box in that position.

	}
	//Size of the grid, excluding the user interface.
	//UI will adjust to different grid sizes, but it shouldn't be made smaller than 4x4
	const GRIDX = 15
	const GRIDY = 15


	var board = {

		width : 0,
		height : 0,
		pixelSize : 1,
		data: [],
		reefData: [],
		treasureX: 0,
		treasureY: 0
	};

	//Color of the water and borders represented as RGB Triplets
	const WATER_COLOR = (0x4B81DC);
	const UI_BORDER = [158, 127, 41]
	const UI_COLOR = [255,220,122];

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

	//Updates the position of the player on the grid based on the values of the player object
	function updatePosition()
	{
		// Set plane to 1 (above floor)

		PS.spritePlane( player.spriteId, 3 );

		// Position sprite at center of grid

		PS.spriteMove( player.spriteId, player.x, player.y );

		PS.spritePlane( player.spriteId, 0 );
		checkSquare(player.x, player.y);

	};

	function resetGame()
	{
		PS.statusText("Team Swift")
		player.gameOver = false;
		player.x = Math.floor(GRIDX/2);
		player.y = 1;
		PS.spriteSolidAlpha(player.spriteId,255)
		for (var a=0; a<GRIDX; a++)  {
			for (var b=0; b<GRIDY; b++)  {
				PS.fade(a,b, 1)
				PS.color(a,b,WATER_COLOR)
				PS.glyph(a,b, "")
			}
		}


		var valid = false;
		while(!valid)
		{
			generateBoard();
			let map = PS.pathMap(board);
			let path = PS.pathFind(map, player.x, player.y, board.treasureX, board.treasureY);
			if(path.length != 0)
			{
				valid = true;
			}
		}


		//Spawns the player
		updatePosition();
	}
	//Generates a random setup.
	function generateBoard()
	{
		board.data = [];
		board.reefData = [];
		for(var y=0; y < GRIDY; y++)
		{
			//PS.color(PS.ALL, y, WATER_COLOR)
		}
		for(var y=0; y < GRIDY; y++)
		{
			for(var x=0; x < GRIDX; x++)
			{
				//Lower the value of the number here to increase the amount of reefs.
				let a = Math.floor(Math.random() * 4);
				if(a === 0)
				{
					board.data.push(0);
					//PS.color(x, y, PS.COLOR_ORANGE);
				}
				else
				{
					board.data.push(1);
				}
			}
		}

		const up = player.y - 1;
		const midY = player.y;
		const down = player.y + 1;
		const left = player.x - 1;
		const midX = player.x;
		const right = player.x + 1;
		//Don't place a bomb on or next to the starting position
		board.data[(up * GRIDX) + left] = 1;
		board.data[(up * GRIDX) + midX] = 1;
		board.data[(up * GRIDX) + right] = 1;
		board.data[(midY * GRIDX) + left] = 1;
		board.data[(midY * GRIDX) + midX] = 1;
		board.data[(midY * GRIDX) + right] = 1;
		board.data[(down * GRIDX) + left] = 1;
		board.data[(down * GRIDX) + midX] = 1;
		board.data[(down * GRIDX) + right] = 1;

		for(var y=0; y < GRIDY; y++)
		{
			for(var x=0; x < GRIDX; x++)
			{
				generateReefValue(x, y);
			}
		}
		PS.color(player.x, player.y, 0x4B81DC);

		var valid = false;
		while(valid == false)
		{
			let goalX = Math.floor(Math.random() * GRIDX);
			let goalY = Math.floor(Math.random() * GRIDY);
			//Don't place the goal on the player
			if(validTreasure(goalX, goalY))
			{
				valid = true;
				board.data[(goalY * GRIDX) + goalX] = 2;
				//PS.color(goalX, goalY, 0xFFC836);
				board.treasureX = goalX;
				board.treasureY = goalY;
			}
		}


	}

	function checkSquare(squareX, squareY)
	{

		switch(getValue(squareX, squareY))
		{
			case 0:
				player.gameOver = true;
				PS.statusText("Your Ship Has Sunk");
				PS.spriteSolidAlpha(player.spriteId,0)
				PS.color(player.x,player.y,0x4B81DC)
				let options = {rgb:(0x7E4A48)}
				PS.fade(player.x,player.y, 60,options);
				PS.spriteMove(player.spriteId, 0,0)
				PS.audioPlay("Sinking", {path:"./"});
				//PS.fade(player.x, player.y, 0);
				break;
			case 1:
				PS.spriteSolidAlpha(player.spriteId,255)
				if(PS.glyph(squareX, squareY) == "")
				{
					addReefValue(squareX, squareY)
				}
				break;
			case 2:
				player.gameOver = true;
				PS.color(squareX, squareY, PS.COLOR_YELLOW)
				PS.statusText("You Found the Treasure!");
				PS.audioPlay("Treasure", {path:"./"});
				break;
		}
	};

	function getValue(squareX, squareY)
	{
		let value = board.data[(squareY * GRIDX) + squareX];
		return value;
	};

	function getReefs(squareX, squareY)
	{
		let value = board.reefData[(squareY * GRIDX) + squareX];
		return value;
	};

	function generateReefValue(squareX, squareY)
	{
		var reefCounter = 0;
		let checkUp = squareY > 0;
		let checkRight = squareX < (GRIDX - 1);
		let checkLeft = squareX > 0;
		let checkDown = squareY < (GRIDY - 1);

		if(checkUp && checkLeft)
		{
			let v = getValue(squareX - 1, squareY - 1);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkUp)
		{
			let v = getValue(squareX, squareY - 1);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkUp && checkRight)
		{
			let v = getValue(squareX + 1, squareY - 1);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkLeft)
		{
			let v = getValue(squareX - 1, squareY);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkRight)
		{
			let v = getValue(squareX + 1, squareY);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkDown && checkLeft)
		{
			let v = getValue(squareX - 1, squareY + 1);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkDown)
		{
			let v = getValue(squareX, squareY + 1);
			if(v === 0)
			{
				reefCounter += 1;
			}
		}

		if(checkDown && checkRight)
		{
			let v = getValue(squareX + 1, squareY + 1);
			if(v === 0)
			{
				reefCounter += 1;
			}

		}

		//Unicode characters for numbers start at 48.
		if(getValue(squareX, squareY) === 0)
		{
			board.reefData.push(9);
		}
		else
		{
			board.reefData.push(reefCounter);

		}
		//board.reefData.push(reefCounter);
	}

	function addReefValue(squareX, squareY)
	{
		let checkUp = squareY > 0;
		let checkRight = squareX < (GRIDX - 1);
		let checkLeft = squareX > 0;
		let checkDown = squareY < (GRIDY - 1);

		//Unicode characters for numbers start at 48.
		PS.glyph(squareX, squareY, 48 + board.reefData[(squareY * GRIDX) + squareX]);

		//console.log(board.reefData[(squareY * GRIDX) + squareX])

		if(PS.glyph(squareX, squareY) == 48)
		{

			if(checkUp && checkLeft)
			{
				checkSquare(squareX - 1, squareY - 1);
			}

			if(checkUp)
			{
				checkSquare(squareX, squareY - 1);
			}

			if(checkUp && checkRight)
			{
				checkSquare(squareX + 1, squareY - 1);
			}

			if(checkLeft)
			{
				checkSquare(squareX - 1, squareY);
			}

			if(checkRight)
			{
				checkSquare(squareX + 1, squareY);
			}

			if(checkDown && checkLeft)
			{
				checkSquare(squareX - 1, squareY + 1);
			}

			if(checkDown)
			{
				checkSquare(squareX, squareY + 1);
			}

			if(checkDown && checkRight)
			{
				checkSquare(squareX + 1, squareY + 1);
			}
			if(board.reefData[squareY*GRIDX+squareX] == 3)
			{
				PS.color(squareX,squareY,0x8cb7ff);
			}
			else if(board.reefData[squareY*GRIDX+squareX] == 2)
			{
				PS.color(squareX,squareY,0x71a1f1);
			}
			else if(board.reefData[squareY*GRIDX+squareX] == 1)
			{
				PS.color(squareX,squareY,0x6597e9);
			}
			else
			{
				PS.color(squareX,squareY,0x4B81DC);
			}



		}
	};

	function validTreasure(squareX, squareY)
	{
		let checkUp = squareY > 0;
		let checkRight = squareX < (GRIDX - 1);
		let checkLeft = squareX > 0;
		let checkDown = squareY < (GRIDY - 1);

		if(checkUp && checkLeft)
		{
			let v = getReefs(squareX - 1, squareY - 1);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkUp)
		{
			let v = getReefs(squareX, squareY - 1);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkUp && checkRight)
		{
			let v = getReefs(squareX + 1, squareY - 1);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkLeft)
		{
			let v = getReefs(squareX - 1, squareY);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkRight)
		{
			let v = getReefs(squareX + 1, squareY);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkDown && checkLeft)
		{
			let v = getReefs(squareX - 1, squareY + 1);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkDown)
		{
			let v = getReefs(squareX, squareY + 1);
			if(v === 0)
			{
				return false;
			}
		}

		if(checkDown && checkRight)
		{
			let v = getReefs(squareX + 1, squareY + 1);
			if(v === 0)
			{
				return false;
			}
		}

		//Don't place treasure on reef or else the board data will be wrong
		let v = getReefs(squareX, squareY)
		{
			if(v === 0 || v === 9)
			{
				return false;
			}
		}
		return true;

		//
	}


	//Creates the user interface and hooks up the buttons to the click methods
	//Will center the UI horizontally based on the grid size
	function addUI()
	{

		//For the border separating the game and the user interface
		for(var x=0; x < GRIDX; x++)
		{
			let width = {
				top : 5,
				left : 0,
				bottom : 0,
				right : 0
			};
			PS.border(x, GRIDY, width);
			PS.borderColor(x, GRIDY, UI_BORDER)
		}

		for(var x=0; x < GRIDX; x++)
		{
			for(var y=0; y < GRIDY; y++)
			{
				board.data.push(0)
			}
		}

		PS.color(PS.ALL, GRIDY, UI_COLOR)
		PS.color(PS.ALL, GRIDY + 1, UI_COLOR)

		let upX = GRIDX/2;
		let upY = GRIDY;
		let downX = GRIDX/2;
		let downY = GRIDY + 1;
		let leftX = (GRIDX/2) - 1;
		let leftY = GRIDY + 1;
		let rightX = (GRIDX/2) + 1;
		let rightY = GRIDY + 1;
		let resetX = (GRIDX/2) + 1;
		let resetY = GRIDY;


		let widthUp = {
			top : 5,
			left : 5,
			bottom : 0,
			right : 5
		}

		let widthLeft = {
			top : 5,
			left : 5,
			bottom : 5,
			right : 0
		}

		let widthRight = {
			top : 5,
			left : 0,
			bottom : 5,
			right : 5
		}

		let widthReset = {
			top : 5,
			left : 0,
			bottom : 0,
			right : 5
		}
		PS.glyph(upX, upY, "^");
		PS.glyph(downX, downY, "v");
		PS.glyph(leftX, leftY, "<");
		PS.glyph(rightX, rightY, ">");
		PS.glyph(resetX, resetY, "R");

		PS.border(upX, upY, widthUp);
		PS.border(downX, downY, 5);
		PS.border(leftX, leftY, widthLeft);
		PS.border(rightX, rightY, widthRight);
		PS.border(resetX, resetY, widthReset);

		PS.borderColor(upX, upY, UI_BORDER);
		PS.borderColor(downX, downY, UI_BORDER);
		PS.borderColor(leftX, leftY, UI_BORDER);
		PS.borderColor(rightX, rightY, UI_BORDER);
		PS.borderColor(resetX, resetY, UI_BORDER);

		PS.exec(upX, upY, clickedUp)
		PS.exec(downX, downY, clickedDown)
		PS.exec(leftX, leftY, clickedLeft)
		PS.exec(rightX, rightY, clickedRight)
		PS.exec(resetX, resetY, resetGame);
	};

	var exports = {
		init: function( system, options ) {
			PS.statusText("Team Swift")
			//Adds 2 rows to the bottom for the user interface.
			PS.gridSize( GRIDX, GRIDY + 2 );
			board.width = GRIDX;
			board.height = GRIDY;

			//Here the grid and backgrounds are set to green
			for (var a=0; a<GRIDX; a++)  {
				for (var b=0; b<GRIDY; b++)  {
					PS.color(a,b,WATER_COLOR)
					PS.fade(a, b, 1);
				}
			}
			PS.gridColor(WATER_COLOR)
			PS.border(PS.ALL, PS.ALL, 0)

			addUI();
			// Change this string to your team name
			// Use only ALPHABETIC characters
			// No numbers, spaces or punctuation!
			player.spriteId = PS.spriteSolid( 1, 1 );
			player.x = Math.floor(GRIDX/2);
			player.y = 1;
			// Set color to red

			PS.spriteSolidColor( player.spriteId, 0x7E4A48);
			//PS.spriteCollide(player.spriteId, collisionFunc)
			var valid = false;
			while(!valid)
			{
				generateBoard();
				let map = PS.pathMap(board);
				let path = PS.pathFind(map, player.x, player.y, board.treasureX, board.treasureY);
				if(path.length != 0)
				{
					valid = true;
				}
			}

			//Spawns the player
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
			if(y < GRIDY && !player.gameOver)
			{
				let a = PS.glyph(x, y);
				if(PS.glyph(x, y) === 182)
				{
					PS.glyph(x, y, 0);
				}
				else if(PS.glyph(x, y) === 0)
				{
					PS.glyph(x, y, 182);
				}
			}
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
			if(key === 114)
			{
				resetGame();
				PS.audioPlay("Respawn", {path:"./"});
			}
			if(!player.gameOver)
			{
				if(key === 1006 || key === 119)
				{
					//If they're not trying to move offscreen
					if(player.y > 0) {
						player.y = player.y - 1;
						PS.audioPlay("Moving", {path:"./"});
					}
				}

				//If left or A
				else if(key === 1005 || key === 97)
				{
					if(player.x > 0) {
						player.x = player.x - 1;
						PS.audioPlay("Moving", {path:"./"});
					}
				}
				//If right or D
				else if(key === 1007 || key === 100)
				{
					if(player.x < (GRIDX - 1))
					{
						player.x = player.x + 1;
						PS.audioPlay("Moving", {path:"./"});
					}

				}
				//If down or S
				else if(key === 1008 || key === 115)
				{
					if(player.y < (GRIDY - 1))
					{
						player.y = player.y + 1;
						PS.audioPlay("Moving", {path:"./"});
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
