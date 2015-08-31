var gameApp = angular.module('gameApp', []);

// Game Controller
gameApp.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
gameApp.controller('GameCtrl', ['$scope', function($scope, $timeout,  shared) {

    /******************************/
    /*** Individual Game Object ***/
    /******************************/
    $scope.game = {
        gameBoard       : [],
        possibleMoves   : [],
        drawBoard       : [],
        gameLog         : [],
        gameTitle       : "",
        gameWinner      : [],
        moveNumber      : 0,
        turn            : "",
        winner          : false,
        draw            : false,

        /**************/
        /* Setup Game */
        /**************/
        setupGame       : function(gameNum) {
            this.gameBoard      = ["","","","","","","","",""];
            this.possibleMoves  = [0,1,2,3,4,5,6,7,8];
            this.drawBoard      = ["","","","","","","","",""];
            this.gameLog        = [];
            this.gameWinner     = [];
            this.gameTitle      = "Game # " + gameNum;
            this.moveNumber     = 0;
            this.winner         = false;
            this.draw           = false;
            if(gameNum % 2 == 0) {
                this.turn = "O";
            } else {
                this.turn = "X";
            }
        },

        /************/
        /* Game Log */
        /************/
        recordGameLog   : function(val) {
            this.gameLog.push(val);
        },
        getGameLog      : function() {
            return this.gameLog;
        },
        recordGameWinner    : function(val) {
            this.gameWinner.push(val);
        },
        getGameWinner       : function() {
            return this.gameWinner;
        },

        /********************/
        /* Check For Winner */
        /********************/
        checkWinner     : function(x,y,z) {
            if( (this.gameBoard[x] === this.gameBoard[y]) && (this.gameBoard[x] === this.gameBoard[z]) && (this.gameBoard[x] != "")) {
                this.recordGameLog("<strong>Player " + this.getTurn() + " won the game</strong>");
                var winningBoard = [x,y,z];
                this.recordGameWinner(winningBoard);
                this.setWinningPlayer();
                this.gameTitle += " - " + this.getTurn() + " Won";
                return true;
            } else {
                return false;
            }
        },
        checkForWinner  : function() {
            if(this.checkWinner(0,1,2) || this.checkWinner(3,4,5) || this.checkWinner(6,7,8) || this.checkWinner(0,3,6)
                || this.checkWinner(1,4,7) || this.checkWinner(2,5,8) || this.checkWinner(0,4,8) || this.checkWinner(2,4,6)) {
                this.winner = true;
            }
        },
        setWinningPlayer    : function() {
            if(this.getTurn() == "X") {
                $scope.stats.addPlayerXWins();
            } else {
                $scope.stats.addPlayerOWins();
            }
        },

        /******************/
        /* Check For Draw */
        /******************/
        checkDraw   : function(x,y,z) {
            if( (this.drawBoard[x] === this.drawBoard[y]) && (this.drawBoard[x] === this.drawBoard[z]) && (this.drawBoard[x] != "")) {
                console.log("winning combo: " + x + ", " + y +", "+z);
                return true;
            } else {
                return false;
            }
        },
        checkForDraw    : function() {
            // Get the final move
            var finalMoveTurn = this.getTurn();
            if(finalMoveTurn == "X") {
                finalMoveTurn = "O";
            } else {
                finalMoveTurn = "X";
            }
            var finalMove = this.possibleMoves[0];
            // Check if final move is a winning move
            this.drawBoard[finalMove] = finalMoveTurn;
            if(this.checkDraw(0,1,2) || this.checkDraw(3,4,5) || this.checkDraw(6,7,8) || this.checkDraw(0,3,6)
                || this.checkDraw(1,4,7) || this.checkDraw(2,5,8) || this.checkDraw(0,4,8) || this.checkDraw(2,4,6)) {
                // No Draw
                this.draw = false;
            } else {
                // Draw
                this.recordGameLog("<strong>Game ended in a draw</strong>");
                this.recordGameWinner("");
                this.gameTitle += " - Draw";
                this.draw = true;
            }
        },

        /*******************/
        /* Moves and Turns */
        /*******************/
        addMoveNumber   : function() {
            this.moveNumber++;
        },
        getMoveNumber   : function() {
            return this.moveNumber;
        },
        getTurn         : function() {
            return this.turn;
        },
        setTurn         : function(val) {
            this.turn = val;
        },
        switchTurn      : function() {
            if(this.getTurn() == "X") {
                this.setTurn("O");
            } else {
                this.setTurn("X");
            }
        },
        recordMove      : function(spot) {
            this.gameBoard[spot] = this.getTurn();
            this.drawBoard[spot] = this.getTurn();
            this.possibleMoves.splice(this.possibleMoves.indexOf(spot), 1);
            this.recordGameLog("Player " + this.getTurn() + " marked spot " + (spot+1));
        },
        makeMove        : function() {
            this.addMoveNumber();
            // Select random spot by getting a random index of the possible moves array
            var spot = this.possibleMoves[Math.floor(Math.random() * this.possibleMoves.length)];
            // Record move made
            this.recordMove(spot);
            // Check if there is a winner after the 4th move
            if(this.getMoveNumber() > 4) {
                this.checkForWinner();
            }
            // Check if game will be a draw after the 8th move
            if(this.winner == false && this.getMoveNumber() == 8) {
                this.checkForDraw();
            }
            // Switch to the next player
            this.switchTurn();
        },
        getGameBoard    : function() {
            return this.gameBoard;
        },
        getGameTitle    : function() {
            return this.gameTitle;
        }
    }

    /***************************************/
    /*** Overall Simulation Stats Object ***/
    /***************************************/
    $scope.stats = {
        gameNumber      : 0,
        playerXWins     : 0,
        playerOWins     : 0,
        gameTitles      : [],
        gameBoards      : [],
        gameWinners     : [],
        gameLogs        : [],
        displayIndex    : -1,
        selectedTitle   : "",
        executionStart  : 0,
        executionTime   : 0,

        /***************/
        /* Game Number */
        /***************/
        addGameNumber   : function() {
            this.gameNumber++;
        },
        getGameNumber   : function() {
            return this.gameNumber;
        },

        /**********/
        /* Boards */
        /**********/
        addGameBoard    : function(val) {
            this.gameBoards.push(val);
        },
        getGameBoard    : function() {
            var result = "";
            if(this.displayIndex > 0) {
                // Get game board to display
                var winningMoves = this.gameWinners[this.displayIndex];
                var board = this.gameBoards[this.displayIndex];
                for(var i=0; i<board.length; i++) {
                    //console.log("moves: " + winningMoves + " index search: " + i + " result: " + winningMoves[0].indexOf(i));
                    if(winningMoves[0].indexOf(i) >= 0) {
                        result += '<div class="board-piece win">'+board[i]+'</div>';
                    } else {
                        result += '<div class="board-piece lose">'+board[i]+'</div>';
                    }
                }
            } else if(this.displayIndex == 0) {
                // Get Summary to display
                var gameSummary = this.gameBoards[0];
                result += '<div class="summary">' + gameSummary.join("<br />") + "</div>";
            } else {
                // Get game introduction
                for(var i=0; i<9; i++) {
                    result += '<div class="board-piece"> </div>';
                }
            }
            return result;
        },

        /********/
        /* Logs */
        /********/
        addGameLog      : function(val) {
            console.log(val);
            this.gameLogs.push(val);
        },
        getGameLog      : function() {
            if(this.displayIndex < 1) {
                $("#log").removeClass('log-content');
                return "";
            } else {
                $("#log").addClass('log-content');
                return this.gameLogs[this.displayIndex ].join("<br />");
            }
        },

        /**********/
        /* Titles */
        /**********/
        addGameTitle    : function(val) {
            this.gameTitles.push(val);
        },
        getGameTitle    : function() {
            if(this.displayIndex >= 0) {
                return this.gameTitles[this.displayIndex];
            } else {
                return "Select Start Simulation";
            }
        },
        getGameTitles    : function() {
            if(this.gameTitles.length > 0) {
                $("#menu").addClass('menu-content');
            }
            return this.gameTitles;
        },

        /***********/
        /* Winners */
        /***********/
        addGameWinner    : function(val) {
            this.gameWinners.push(val);
            console.log("recording winner");
        },
        getGameWinner       : function() {
            if(this.displayIndex > 0) {
                console.log("winner: " + this.gameWinners[this.displayIndex]);
                return this.gameWinners[this.displayIndex];
            } else {
                return "";
            }
        },

        /*********************/
        /* Stats and Summary */
        /*********************/
        addGameStats    : function(title, board, log, winner) {
            this.addGameTitle(title);
            this.addGameBoard(board);
            this.addGameLog(log);
            this.addGameWinner(winner);
        },
        addGameSummary  : function() {
            this.gameTitles.unshift("Summary");
            var gameSummary = [this.getGameNumber() + " games played", "Player X won " + this.getPlayerXWins() + " games", "Player O won " + this.getPlayerOWins() + " games", (this.getGameNumber()-this.getPlayerOWins()-this.getPlayerXWins()) + " games ended in a draw", "Simulation took " + this.executionTime + " milliseconds to run"];
            console.log(gameSummary);
            this.gameBoards.unshift(gameSummary);
            this.gameLogs.unshift("");
            this.gameWinners.unshift("");
        },
        getOverview     : function() {
            var overview = "";
            if(this.displayIndex >= 0) {
                if (this.playerOWins > 9) {
                    // O won 10 games first
                    overview += '<h2>Player O won 10 games first!</h2>';
                } else if (this.playerXWins > 9) {
                    // X won 10 games first
                    overview += '<h2>Player X won 10 games first!</h2>';
                } else {
                    // Error no one won 10 games
                    overview += '<h2>An error occurred. Neither player won 10 games?!</h2>';

                }
                overview += '<div id="button" class="new-game-button" onClick="history.go(0)">New Simulation</div>';
            }
            return overview;

        },


        /************/
        /* Player X */
        /************/
        addPlayerXWins  : function() {
            this.playerXWins++;
        },
        getPlayerXWins  : function() {
            return this.playerXWins;
        },

        /************/
        /* Player O */
        /************/
        addPlayerOWins  : function() {
            this.playerOWins++;
        },
        getPlayerOWins  : function() {
            return this.playerOWins;
        },

        /********************/
        /* Execution Timing */
        /********************/
        startTime       : function () {
            this.executionStart = new Date();
        },
        endTime         : function() {
            this.executionTime = new Date() - this.executionStart;
        }

    }

    /***********************/
    /*** Simulation Flow ***/
    /***********************/
    $scope.setupGame        = function() {
        $scope.stats.addGameNumber();
        $scope.game.setupGame($scope.stats.getGameNumber());
    }
    $scope.simulateGame     = function() {
        $scope.setupGame();
        while($scope.game.winner == false && $scope.game.draw == false && $scope.game.getMoveNumber() < 10) {
            $scope.game.makeMove();
        }
        $scope.stats.addGameStats($scope.game.getGameTitle(), $scope.game.getGameBoard(), $scope.game.getGameLog(), $scope.game.getGameWinner());
    }
    $scope.startGame        = function() {
        $scope.stats.startTime();
        $("#button").css("display", "none");
        while($scope.stats.playerXWins < 10 && $scope.stats.playerOWins < 10) {
            $scope.simulateGame();
        }
        $scope.stats.endTime();
        $scope.stats.addGameSummary();
        $scope.stats.displayIndex = 1;

    };
    $scope.displayGame      = function(title) {
        $scope.stats.selectedTitle = title;
        if(title == "Summary") {
            $scope.stats.displayIndex = 0;
        } else {
            var index = title.indexOf("#");
            var gameNumber = parseInt(title.substr(index + 1));
            $scope.stats.displayIndex = gameNumber;
        }

    };
    $scope.reloadPage     = function() {
        $(window).location.reload();
    };

}]);