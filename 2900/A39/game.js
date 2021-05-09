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

	//Amount of time in seconds until the game ends
	const GAME_TIME = 210;

	//Contains information about the player
	var player = {
		//String used to retrieve player sprite
		spriteId: "",
		//Location of player on the current board
		x: 0,
		y: 0,
		//Location of player in the maze
		mazeX: 0,
		mazeY: 0,
		//Amount of collectables they have
		treasure: 0,
		people: 0,
		//Determines if the player is allowed to move around
		gameOver: true,
	}

	//Information about the game and the game board
	var board = {
		//Contains all levels. Arranged in the form of a 3D array
		levels: [],
		time: GAME_TIME,
		//String used to retrieve the game timer
		gameTimer: "",
		//String used to retrieve timer that prints messages at regular intervals
		messageTimer: "",
		//Message that is printed to the screen when the player enters a new room
		message: "",
		//String to retieve the audio channel for the background music
		backgroundChannel: "",
		//List of messages to print to the screen
		messageQueue: [],
	}


	//Structure to keep track of keyboard presses
	var keyboard = {
		W: false,
		A: false,
		S: false,
		D: false,
		Up: false,
		Left: false,
		Down: false,
		Right: false,
		Space: false
	}

	//Size of the grid
	const GRIDX = 16
	const GRIDY = 16

	//Size of the maze in blocks, with each block being 16x16 squares
	const MAZEX = 5
	const MAZEY = 4

	//Colors that are used when reading the map data
	const COLOR_RED = 0xFF0000;
	const COLOR_CYAN = 0x00FFFF;
	const COLOR_GREEN = 0x00FF00;
	const COLOR_YELLOW = 0xFFFF00;
	const COLOR_BLACK = 0x000000;
	const COLOR_BLUE = 0x0000FF;



	//Colors that are displayed to the screen
	const GROUND_COLOR = [220,120,120];
	const EXIT_COLOR = [255,170,170];
	const ONESTEP_COLOR = [200,90,90];
	const WALL_COLOR = [130,30,30];
	const TREASURE_COLOR = [255, 255, 0];
	const PERSON_COLOR = [0, 255, 255];
	const PLAYER_COLOR = [255, 0, 0];

	//Updates the position of the player on the grid based on the values of the player object
	function updatePosition()
	{
		PS.spritePlane( player.spriteId, 1 );
		PS.spriteMove( player.spriteId, player.x, player.y );
	};

	//Restarts the game from the beginning
	function resetGame()
	{
		//Restart the background music
		PS.audioPlayChannel(board.backgroundChannel, {volume: 2, loop: true});
		//Reset board and player data
		board.message = "The pyramid is collapsing"
		board.messageQueue = [];
		board.time = GAME_TIME;

		PS.spriteDelete(player.spriteId)
		player.people = 0;
		player.treasure = 0;

		//Display starting message
		displayPlayerMessage();

		//Reset game board
		PS.gridSize( GRIDX, GRIDY);

		//Reset the grid colors
		for (var a=0; a<GRIDX; a++)  {
			for (var b=0; b<GRIDY; b++)  {
				PS.color(a,b,GROUND_COLOR)
			}
		}
		PS.border(PS.ALL, PS.ALL, 0)

		//Initialize the game board structure
		for( var y=0; y<MAZEY; y++) {
			let a = [];
			board.levels.push(a);
			for( var x=0; x<MAZEX; x++) {
				let b = [];
				board.levels[y].push(b);
			}
		}




		//Spawn the player
		player.spriteId = PS.spriteSolid( 1, 1 );
		player.x = Math.floor(GRIDX/2);
		player.y = Math.floor(GRIDY/2);
		player.mazeX = 2;
		player.mazeY = 3;
		PS.spriteSolidColor( player.spriteId, PLAYER_COLOR);
		updatePosition();

		//Load all the levels. Will start the game once the main hall is loaded
		loadMap(0, 0, "GameLevels/A1.bmp");
		loadMap(1, 0, "GameLevels/A2.bmp");
		loadMap(2, 0, "GameLevels/A3.bmp");
		loadMap(3, 0, "GameLevels/A4.bmp");
		loadMap(4, 0, "GameLevels/A5.bmp");
		loadMap(0, 1, "GameLevels/B1.bmp");
		loadMap(1, 1, "GameLevels/B2.bmp");
		loadMap(2, 1, "GameLevels/B3.bmp");
		loadMap(3, 1, "GameLevels/B4.bmp");
		loadMap(4, 1, "GameLevels/B5.bmp");
		loadMap(0, 2, "GameLevels/C1.bmp");
		loadMap(1, 2, "GameLevels/C2.bmp");
		loadMap(2, 2, "GameLevels/C3.bmp");
		loadMap(3, 2, "GameLevels/C4.bmp");
		loadMap(4, 2, "GameLevels/C5.bmp");
		loadMap(0, 3, "GameLevels/D1.bmp");
		loadMap(1, 3, "GameLevels/D2.bmp");
		loadMap(2, 3, "GameLevels/D3.bmp");
		loadMap(3, 3, "GameLevels/D4.bmp");
		loadMap(4, 3, "GameLevels/D5.bmp");
	}

	//Load the map from the given bitmap image.
	function loadMap(mazeX, mazeY, imageFile)
	{
		var mapLoader;

		// Image loading function
		// Called when image loads successfully
		// [data] parameter will contain imageData

		mapLoader = function ( imageData ) {

			// Extract colors from imageData, convert them to map data
			// and assign the map data at the given mazeX,mazeY coordinates.
			var color;
			var ptr = 0;
			let room = [];
			for (var y = 0; y < GRIDY; y++) {
				for (var x = 0; x < GRIDX; x++ ) {
					color = imageData.data[ ptr ]; // get color
					//Black/0: Wall
					//Green/1: Ground
					//Cyan/2: Teammate
					//Yellow/3: Treasure
					//Red/4: Exit
					//Blue/5: OneStep Ground
					switch(color)
					{
						case COLOR_CYAN:
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
						case COLOR_BLUE:
							room.push(5);
							break;
						default:
							room.push(0);
							break;
					}
					ptr += 1; // point to next value
				}
			}
			board.levels[mazeY][mazeX] = room;

			//Start the game once the starting location is loaded
			if(imageData.source == "GameLevels/D3.bmp")
			{
				drawMap(2, 3, true);
				player.gameOver = false;
				board.gameTimer = PS.timerStart(60, timerTick)
			}

		};

		PS.imageLoad( imageFile, mapLoader, 1 );
	}

	//Called when background audio is loaded
	//Starts playing as soon as it's loaded
	var audioLoad = function (options)
	{
		board.backgroundChannel = options.channel;
		PS.audioPlayChannel(board.backgroundChannel, {volume: 2, loop: true});
	}

	//Called every second. Updates the game timer and ends the game if it runs out
	var timerTick = function()
	{
		board.time -= 1;
		if(board.time > 0)
		{
			PS.statusText(displayPlayerMessage());
		}
		else
		{
			PS.timerStop(board.gameTimer);
			player.gameOver = true;
			PS.statusText("I wasn't able to escape. (Space to retry)")
			PS.audioStop(board.backgroundChannel);
			PS.audioPlay("Collapse", {path:"./"});
			PS.fade(PS.ALL, PS.ALL, 60)
			playEndScreen(false)
		}

	};

	//Converts given time(in seconds) to a string displaying the time in the format "m:ss".
	function getTimeString(time)
	{
		var minutes = Math.floor(time/60);

		var seconds = time - (minutes * 60);

		if(seconds < 10)
		{
			let timeString = minutes.toString() + ":0" + seconds.toString();
			return timeString;
		}
		else
		{
			let timeString = minutes.toString() + ":" + seconds.toString();
			return timeString;
		}
	}

	//Start process of displaying given messages in sequence (Once every 5 seconds)
	function displayMultiMessage(messageArray)
	{
		board.messageQueue = messageArray;
		PS.statusText(board.messageQueue.shift())
		board.messageTimer = PS.timerStart(300, messageTick)
	}

	//Called every 5 seconds if there are messages to display. Displays the next message in the message queue.
	var messageTick = function()
	{
		if(board.messageQueue.length > 0)
		{
			PS.statusText(board.messageQueue.shift())
		}
		else
		{
			PS.timerStop(board.messageTimer)
		}
	};

	//Selects and shows the end screen upon the game ending
	//There are 4 different end screens
	function playEndScreen(winLose)
	{
		if(winLose == true)
		{
			if (player.people > player.treasure)
			{
				PS.imageLoad("peoplewin.bmp",loader);

			}
			else if (player.people < player.treasure)
			{
				PS.imageLoad("treasurewin.bmp",loader);
			}
			else if (player.people == player.treasure)
			{
				PS.imageLoad("overallwin.bmp",loader);
			}
		}
		else
		{
			PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK)
		}
	}

	//Displays the given image to the screen
	function loader(image) {
		PS.imageBlit(image, 0, 0)
	}

	//Displays the current time next to the player's current message
	function displayPlayerMessage()
	{
		let str = getTimeString(board.time) + "     " + board.message;
		PS.statusText(str);
	}

	//Draws the map at mazeX, mazeY to the screen
	function drawMap(mazeX, mazeY, firstDraw)
	{
		//If it's the first time drawing, display the starting message
		if(!firstDraw)
		{
			board.message = "The pyramid is collapsing"
			displayPlayerMessage();
		}

		let room = board.levels[mazeY][mazeX];

		for(var y=0; y<GRIDY; y++)
		{
			for(var x=0; x<GRIDX; x++)
			{
				let square = room[y * GRIDX + x]
				switch(square)
				{
					case 0:
						PS.color(x, y, WALL_COLOR)
						break;
					case 1:
						PS.color(x, y, GROUND_COLOR)
						break;
					case 2:
						PS.color(x, y, PERSON_COLOR)
						break;
					case 3:
						PS.color(x, y, TREASURE_COLOR)
						break;
					case 4:
						PS.color(x, y, EXIT_COLOR)
						break;
					case 5:
						PS.color(x, y, ONESTEP_COLOR);
						break;
					default:
						PS.color(x, y, WALL_COLOR)
				}

			}
		}


	}

	//Gets the value of the given square on the map
	function getValue(mazeX, mazeY, squareX, squareY)
	{
		let value = board.levels[mazeY][mazeX][squareY * GRIDX + squareX];
		return value;
	};

	var exports = {
		init: function( system, options ) {
			//Load background audio
			PS.audioLoad("Background", {path:"./", onLoad: audioLoad, volume: 0.1});

			//Set status line text
			board.message = "The pyramid is collapsing"
			displayPlayerMessage();

			PS.gridSize( GRIDX, GRIDY);

			//Set board color
			board.time = GAME_TIME;
			for (var a=0; a<GRIDX; a++)  {
				for (var b=0; b<GRIDY; b++)  {
					PS.color(a,b,GROUND_COLOR)
				}
			}
			PS.border(PS.ALL, PS.ALL, 0)


			//Initialize level data structure
			for( var y=0; y<MAZEY; y++) {
				let a = [];
				board.levels.push(a);
				for( var x=0; x<MAZEX; x++) {
					let b = [];
					board.levels[y].push(b);
				}
			}


			//Create and place the player
			player.spriteId = PS.spriteSolid( 1, 1 );
			player.x = Math.floor(GRIDX/2);
			player.y = Math.floor(GRIDY/2);
			player.mazeX = 2;
			player.mazeY = 3;
			PS.spriteSolidColor( player.spriteId, PLAYER_COLOR);
			updatePosition();

			//Load all the level data
			loadMap(0, 0, "GameLevels/A1.bmp");
			loadMap(1, 0, "GameLevels/A2.bmp");
			loadMap(2, 0, "GameLevels/A3.bmp");
			loadMap(3, 0, "GameLevels/A4.bmp");
			loadMap(4, 0, "GameLevels/A5.bmp");
			loadMap(0, 1, "GameLevels/B1.bmp");
			loadMap(1, 1, "GameLevels/B2.bmp");
			loadMap(2, 1, "GameLevels/B3.bmp");
			loadMap(3, 1, "GameLevels/B4.bmp");
			loadMap(4, 1, "GameLevels/B5.bmp");
			loadMap(0, 2, "GameLevels/C1.bmp");
			loadMap(1, 2, "GameLevels/C2.bmp");
			loadMap(2, 2, "GameLevels/C3.bmp");
			loadMap(3, 2, "GameLevels/C4.bmp");
			loadMap(4, 2, "GameLevels/C5.bmp");
			loadMap(0, 3, "GameLevels/D1.bmp");
			loadMap(1, 3, "GameLevels/D2.bmp");
			loadMap(2, 3, "GameLevels/D3.bmp");
			loadMap(3, 3, "GameLevels/D4.bmp");
			loadMap(4, 3, "GameLevels/D5.bmp");
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

			var val = -1;
			//Don't let player move if the game is over
			if(!player.gameOver)
			{
				//Checks for WASD and arrow key presses. Also checks for space bar presses
				switch(key)
				{
					case 1006:
						keyboard.Up = true;
						//Ensures the player can't use both WASD and arrow keys together to gain a speed advantage
						if(!(keyboard.A || keyboard.D || keyboard.W || keyboard.S))
						{
							//If they're not trying to move offscreen, try to move the player
							if(player.y > 0) {
								val = getValue(player.mazeX, player.mazeY, player.x, player.y - 1)
								//If the square isn't a wall, move the player
								if(val != 0 )
								{
									player.y = player.y - 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}
							}
							//If the player is moving offscreen, transition to the next level
							else
							{
								player.mazeY -= 1;
								drawMap(player.mazeX, player.mazeY);
								player.y = GRIDY - 1;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 119:
						keyboard.W = true;
						if(!(keyboard.Up || keyboard.Right || keyboard.Left || keyboard.Down))
						{
							//If they're not trying to move offscreen
							if(player.y > 0) {
								val = getValue(player.mazeX, player.mazeY, player.x, player.y - 1)

								if(val != 0 )
								{
									player.y = player.y - 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}
								//PS.audioPlay("Moving", {path:"./"});
							}
							else
							{
								player.mazeY -= 1;
								drawMap(player.mazeX, player.mazeY);
								player.y = GRIDY - 1;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 1005:
						keyboard.Left = true;
						if(!(keyboard.A || keyboard.D || keyboard.W || keyboard.S))
						{
							if(player.x > 0) {
								val = getValue(player.mazeX, player.mazeY, player.x - 1, player.y)
								if(val != 0) {
									player.x = player.x - 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}
								//PS.audioPlay("Moving", {path:"./"});
							}
							else
							{
								player.mazeX -= 1;
								drawMap(player.mazeX, player.mazeY);
								player.x = GRIDX - 1;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 97:
						keyboard.A = true;
						if(!(keyboard.Up || keyboard.Right || keyboard.Left || keyboard.Down))
						{
							if(player.x > 0) {
								val = getValue(player.mazeX, player.mazeY, player.x - 1, player.y)
								if(val != 0) {
									player.x = player.x - 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}
								//PS.audioPlay("Moving", {path:"./"});
							}
							else
							{
								player.mazeX -= 1;
								drawMap(player.mazeX, player.mazeY);
								player.x = GRIDX - 1;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 1007:
						keyboard.Right = true;
						if(!(keyboard.A || keyboard.D || keyboard.W || keyboard.S))
						{
							if(player.x < (GRIDX - 1))
							{
								val = getValue(player.mazeX, player.mazeY,player.x + 1, player.y)
								if(val != 0)
								{
									player.x = player.x + 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}

								//PS.audioPlay("Moving", {path:"./"});
							}
							else
							{
								player.mazeX += 1;
								drawMap(player.mazeX, player.mazeY);
								player.x = 0;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 100:
						keyboard.D = true;
						if(!(keyboard.Up || keyboard.Right || keyboard.Left || keyboard.Down))
						{
							if(player.x < (GRIDX - 1))
							{
								val = getValue(player.mazeX, player.mazeY,player.x + 1, player.y)
								if(val != 0)
								{
									player.x = player.x + 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}

								//PS.audioPlay("Moving", {path:"./"});
							}
							else
							{
								player.mazeX += 1;
								drawMap(player.mazeX, player.mazeY);
								player.x = 0;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 1008:
						keyboard.Down = true;
						if(!(keyboard.A || keyboard.D || keyboard.W || keyboard.S))
						{
							if(player.y < (GRIDY - 1))
							{
								val = getValue(player.mazeX, player.mazeY, player.x, player.y + 1)
								if(val != 0)
								{
									player.y = player.y + 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}

							}
							else
							{
								player.mazeY += 1;
								drawMap(player.mazeX, player.mazeY);
								player.y = 0;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 115:
						keyboard.S = true;
						if(!(keyboard.Up || keyboard.Right || keyboard.Left || keyboard.Down))
						{
							if(player.y < (GRIDY - 1))
							{
								val = getValue(player.mazeX, player.mazeY, player.x, player.y + 1)
								if(val != 0)
								{
									player.y = player.y + 1;
									PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
								}

							}
							else
							{
								player.mazeY += 1;
								drawMap(player.mazeX, player.mazeY);
								player.y = 0;
								PS.audioPlay("Footsteps", {path:"./", volume: 0.1});
							}
						}
						break;
					case 32:
						//This check ensures holding the space key doesn't trigger multiple presses
						//If the game isn't over and they press space, end the game
						if(!keyboard.Space)
						{
							player.gameOver = true;
							PS.timerStop(board.gameTimer);
							PS.statusText("It's over. I accept my fate. (Space to retry)")
							PS.audioStop(board.backgroundChannel);
							PS.audioPlay("Collapse", {path:"./"});

							playEndScreen(false)
						}
						keyboard.Space = true;
						break;
				}




			}
			//If the game is over, and they press space, restart the game
			else
			{
				if(key === 32 && (!keyboard.Space))
				{
					resetGame();
				}
				keyboard.Space = true;
			}

			//If the player moves onto a teammate square
			if(val == 2)
			{
				//Collect the teammate, display a message and update the board
				player.people += 1;
				PS.audioPlay("Human_Collect", {path:"./"});
				board.message = "I've found one of my teammates"
				displayPlayerMessage();
				board.levels[player.mazeY][player.mazeX][player.y * GRIDX + player.x] = 1;
				PS.color(player.x, player.y, GROUND_COLOR);
			}
			//If the player moves onto a treasure square
			if(val == 3)
			{
				//Collect the artifact, display a message and update the board
				player.treasure += 1;
				PS.audioPlay("Artifact_Collect", {path:"./"});
				board.message = "I've found an ancient artifact"
				displayPlayerMessage();
				board.levels[player.mazeY][player.mazeX][player.y * GRIDX + player.x] = 1;
				PS.color(player.x, player.y, GROUND_COLOR);
			}
			//If the player moves onto an exit square
			if(val == 4)
			{
				//End the game and display the ending messages
				player.gameOver = true;
				PS.timerStop(board.gameTimer);
				playEndScreen(true)
				let messages = [];
				if(player.people == 30)
				{
					messages.push(player.people + " saved and " + player.treasure + " found.")
					messages.push("I managed to rescue everyone.")
					messages.push("They're eternally grateful for my help")
					messages.push("I made the right choice")
				}
				else if(player.treasure == 40)
				{
					messages.push(player.people + " saved and " + player.treasure + " found.")
					messages.push("I found all the artifacts")
					messages.push("I couldn't let them be lost")
					messages.push("I made the right choice")
				}
				else if(player.people == 0 && player.treasure == 0)
				{
					messages.push(player.people + " saved and " + player.treasure + " found.")
					messages.push("I saved what was important")
					messages.push("I made the right choice")
				}
				else
				{
					messages.push(player.people + " saved and " + player.treasure + " found.")
					messages.push("I did everything I could")
					messages.push("I made the right choice")
				}

				displayMultiMessage(messages);
			}

			//If the player moves onto a OneStep square
			if(val == 5)
			{
				//Make the square a wall
				board.levels[player.mazeY][player.mazeX][player.y * GRIDX + player.x] = 0;
				PS.color(player.x, player.y, WALL_COLOR);
			}
			//Move the player
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


			//Keeps track of player's keyboard presses to closely control how the player moves in response.
			switch(key)
			{
				case 1006:
					keyboard.Up = false;
					break;
				case 119:
					keyboard.W = false;
					break;
				case 1005:
					keyboard.Left = false;
					break;
				case 97:
					keyboard.A = false;
					break;
				case 1007:
					keyboard.Right = false
					break;
				case 100:
					keyboard.D = false;
					break;
				case 1008:
					keyboard.Down = false;
					break;
				case 115:
					keyboard.S = false;
					break;
				case 32:
					keyboard.Space = false;
					break;
			}

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