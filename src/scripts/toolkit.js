function funcInitKeyboard() {
    htmlDivKeyboardContainer.innerHTML = null;

    var intKeyIndex = 0;

    for (var i = 0; i < intKeyboardSize.length; i++) {
        const htmlKeyboardRow = document.createElement("div");
        htmlKeyboardRow.classList.add("div-keyboard-row");

        for (var j = 0; j < intKeyboardSize[i]; j++) {
            const htmlKey = document.createElement("div");
            if (strKeyboardConfig[intKeyIndex] == "↩") {
                htmlKey.innerHTML = "Enter";
                htmlKey.id = "div-key-enter";
            } else {
                htmlKey.innerHTML = strKeyboardConfig[intKeyIndex];
                htmlKey.id = "div-key-" + strKeyboardConfig[intKeyIndex].toLowerCase();
            }

            htmlKey.classList.add("div-keyboard-key");

            switch (intKeySize[intKeyIndex]) {
                case 0: 
                    htmlKey.classList.add("div-key-small");
                    break;
                case 1: 
                    htmlKey.classList.add("div-key-large");
                    break;
            }

            htmlKey.dataset.style = intKeyboardStyle;

            htmlKeyboardRow.append(htmlKey);

            intKeyIndex++;
        }

        htmlDivKeyboardContainer.append(htmlKeyboardRow);
    }
}

function funcInitBoard() {

    htmlDivWordleBoard.innerHTML = null;

    var html = "";
	
	for (var i = 0; i < 6; i++) {
		html += "<div class='div-wordle-row' id='div-wordle-row-" + i + "'>";
		for (var j = 0; j < intWordleLength; j++) {
			html += "<div class='div-wordle-tile div-wordle-row-" + i + "-tile' id='div-wordle-row-" + i + "-tile-" + j +"'> </div>";
		}
		html += "</div>";
	}

    htmlDivWordleBoard.innerHTML = html;

    const htmlMultiplier = document.getElementById("div-multiplier-container");
    const htmlStats = document.getElementById("div-stats-container");

    switch (intGameMode) {
        case 0: 
            htmlMultiplier.classList.add("div-multiplier-container-hide");
            htmlStats.classList.add("div-stats-container-hide");
            break;
        case 1: 
            htmlMultiplier.classList.remove("div-multiplier-container-hide");
            htmlStats.classList.remove("div-stats-container-hide");
            break;
        case 2: 
            htmlMultiplier.classList.remove("div-multiplier-container-hide");
            htmlStats.classList.remove("div-stats-container-hide");
            break;
        case 3: 
            htmlMultiplier.classList.remove("div-multiplier-container-hide");
            htmlStats.classList.remove("div-stats-container-hide");
            break;
    }
}

function funcRandomValueFromRange(lower, upper) {
	return Math.floor(lower + (Math.random() * (upper - lower)));
}

function funcMin(a, b) {
	if (a > b) return b;
	else return a;
}

function funcMax(a, b) {
	if (a > b) return a;
	else return b;
}

function funcKeyEnter(key) {
    if (document.querySelectorAll("[data-state='active']").length >= intWordleLength) return;

    const htmlNextTile = document.getElementById("div-wordle-row-" + intRow + "-tile-" + intTile);
    htmlNextTile.innerHTML = key;
    htmlNextTile.dataset.state = "active";

    intTile++;
}

function funcKeyDelete() {
    const htmlLastTile = document.getElementById("div-wordle-row-" + intRow + "-tile-" + (intTile - 1));
    if (htmlLastTile == null) return;

    htmlLastTile.innerHTML = null;
    delete htmlLastTile.dataset.state;

    intTile--;
}

function funcIncludesWord(strTargetWord) {
	var intStartIndex = 0;
	var intStopIndex = intAllowedGuessesCount - 1;
	var intMidIndex = Math.floor((intStartIndex + intStopIndex) / 2);

	while(strAllowedGuesses[intMidIndex] != strTargetWord && intStartIndex < intStopIndex){
		
        //adjust search area
        if (strTargetWord < strAllowedGuesses[intMidIndex]){
            intStopIndex = intMidIndex - 1;
        } else if (strTargetWord > strAllowedGuesses[intMidIndex]){
            intStartIndex = intMidIndex + 1;
        }

        //recalculate middle
        intMidIndex = Math.floor((intStopIndex + intStartIndex)/2);
    }

	return (strAllowedGuesses[intMidIndex] == strTargetWord);
}

function funcPopup(strContent, intDuration = 1000, intType = -1) {
    const htmlPopup = document.createElement("div");

    htmlPopup.innerHTML = strContent;
    htmlPopup.classList.add("div-popup");

    switch (intType) {
        case 0: 
            htmlPopup.classList.add("div-popup-score-excluded");
            break;
        case 1: 
            htmlPopup.classList.add("div-popup-score-included");
            break;
        case 2: 
            htmlPopup.classList.add("div-popup-score-accepted");
            break;
    }

    htmlDivPopupContainer.prepend(htmlPopup);

    setTimeout(() => {
        htmlPopup.classList.add("div-popup-expand");
    }, intPopupDuration / 100);

    setTimeout(() => {
        htmlPopup.classList.add("div-popup-fade");
        htmlPopup.addEventListener("transitionend", function () {
            htmlPopup.remove();
        })
        // setTimeout(() => {
            
        // }, intMiscAnimationsDuration);
    }, intDuration);
}

function funcStartInteraction() {
    document.addEventListener("keydown", funcKeyPress);
    document.addEventListener("click", funcClick);
}

function funcTerminateInteraction() {
    document.removeEventListener("keydown", funcKeyPress);
    document.removeEventListener("click", funcClick);
}

function funcKeyPress(e) {
    const strKeyCode = String(e.key);
    if (strKeyCode == "Backspace" || strKeyCode == "Delete") {
        funcKeyDelete();
    } else if (strKeyCode == "Enter") {
        if (e.repeat) return;
        funcCheckAnswer();
    } else if ((strKeyCode.match(/^[a-z]/) || strKeyCode.match(/^[A-Z]/)) && strKeyCode.length == 1) {
        if (e.repeat) return;
        funcKeyEnter(strKeyCode);
    }
}

function funcClick(e) {
    const strMouseTarget = (e.target.innerHTML).toLowerCase();

    if (!e.target.classList.contains("div-keyboard-key")) return;

    if (strMouseTarget == "⟵") {
        funcKeyDelete();
    } else if (strMouseTarget == "enter") {
        funcCheckAnswer();
    } else if (strMouseTarget.match(/^[a-z]/)) {
        funcKeyEnter(strMouseTarget);
    }
}

function funcUpdateKey(strKeyID, intKeyState) {
    document.getElementById("div-key-" + strKeyID).dataset.state = strKeyStates[intKeyState];
}

function funcRevealTiles(intResponse, strGuess, _intRow, strFormattedGuess) {
    funcTerminateInteraction();
    if (intAnimations) {
        for (var i = 0; i <= intWordleLength; i++) {
            setTimeout((k) => {
                if (k == intWordleLength) {
                    funcUpdateKeys(intResponse, strFormattedGuess);
                    funcStartInteraction();
                    funcDetectWin(intResponse);
                } else {
                    const htmlTile = document.getElementById("div-wordle-row-" + _intRow + "-tile-" + k);
                    htmlTile.innerHTML = strGuess[k];
                    htmlTile.classList.add("div-wordle-tile-flip");

                    htmlTile.addEventListener("transitionend", () => {
                        htmlTile.dataset.state = strKeyStates[intResponse[k]];
                        htmlTile.classList.remove("div-wordle-tile-flip");
                    });

                    if (intGameMode == 3) {
                        var intScoreIncrement = intBlastPoints[intResponse[k]] * intBlastMultiplier[_intRow];
                        intScore += intScoreIncrement;
                        funcPopup("+" + intScoreIncrement, intScoreDuration, intResponse[k]);
                        funcUpdateStats();
                    }
                }
            }, (intAnimationDuration * i), i)
        }
    } else {
        for (var i = 0; i < intWordleLength; i++) {
            const htmlTile = document.getElementById("div-wordle-row-" + _intRow + "-tile-" + i);
            htmlTile.innerHTML = strGuess[i];
            htmlTile.dataset.state = strKeyStates[intResponse[i]];
        }
        funcUpdateKeys(intResponse, strFormattedGuess);
        funcStartInteraction();
        funcDetectWin(intResponse);
    }
}

function funcDetectWin(intResponse) {
    var boolWinState = true;
	for (var i = 0; i < intWordleLength; i++) {
		if (intResponse[i] != 2) {
			boolWinState = false;
		}
	}

    const htmlModeMenu = document.getElementById("div-mode-menu");
    const htmlShader = document.getElementById("div-mode-menu-shader");

	if (boolWinState) {
        if (intAnimations) {
            if (intGameMode == 3) {
                console.log(intRow)
                var intScoreIncrement = intBlastPoints[3] * intBlastMultiplier[intRow - 1];
                intScore += intScoreIncrement;
                funcUpdateStats();
                funcPopup("+" + intScoreIncrement, intScoreDuration);
            }
            funcAnimateTiles(1);
            funcPopup(strWinComments[intRow - 1], intPopupDuration);
            if (intGameMode == 0) funcTerminateInteraction();
            else setTimeout(() => {
                funcNewWord();
            }, intAnimationDuration * 5);
            if (intGameMode == 0) setTimeout(() => funcToggleModeMenu(htmlModeMenu, htmlShader), intAnimationDuration * 2);
        } else {
            funcPopup(strWinComments[intRow], intPopupDuration);
            if (intGameMode == 0) funcTerminateInteraction();
            else funcNewWord();
            if (intGameMode == 0) funcToggleModeMenu(htmlModeMenu, htmlShader);
        }
        return;
	} else if ((intRow == 6 && intAnimations) || (intRow == 5 && !intAnimations)) {
        funcPopup(strAnswer.toUpperCase(), intPopupDuration);
        funcTerminateInteraction();
        funcToggleModeMenu(htmlModeMenu, htmlShader);
        return;
    }
}

function funcAnimateTiles(intAnimationID) {
    // Animation ID: 0 - shake, 1 - dance
    switch (intAnimationID) {
        case 0: 
            const htmlActiveTiles = funcGetActiveTiles();
            htmlActiveTiles.forEach((htmlTile) => {
                htmlTile.classList.add("div-wordle-tile-shake");
                htmlTile.addEventListener("animationend", () => {
                    htmlTile.classList.remove("div-wordle-tile-shake");
                }, { once: true });
            });
            break;
        case 1: 
            const htmlWinningTiles = functGetWinningTiles();
            htmlWinningTiles.forEach((htmlTile, i) => {
                setTimeout(() => {
                    htmlTile.classList.add("div-wordle-tile-dance");
                    htmlTile.addEventListener("animationend", () => {
                        htmlTile.classList.remove("div-wordle-tile-dance");
                    }, { once: true });
                }, intAnimationDuration * i / 5);
            });
            break;
    }
}

function funcGetActiveTiles() {
    return document.querySelectorAll("[data-state='active']");
}

function functGetWinningTiles() {
    return document.querySelectorAll("div.div-wordle-row-" + (intRow - 1) + "-tile");
}

function funcInitPage() {
    funcInitBoard();
    funcStartInteraction();
    funcInitKeyboard();
    funcInitIcons();
}

function funcCheckAnswer() {

    const strGuess = ["", "", "", "", ""];

    for (var i = 0; i < intWordleLength; i++) {
        strGuess[i] = document.getElementById("div-wordle-row-" + intRow + "-tile-" + i).innerHTML;
    }

	var strFormattedGuess = "";

	for (var i = 0; i < intWordleLength; i++) {
        strFormattedGuess += strGuess[i];
	}

	// console.log(strAllowedGuesses.includes(strFormattedGuess.toLowerCase()));

    if (intTile < intWordleLength) {
        funcPopup(strAlertNotEnoughLetters, intAlertDuration);
        funcAnimateTiles(0);
		return;
    } else if (!(funcIncludesWord(strFormattedGuess) || strAnswers.includes(strFormattedGuess))) {
		funcPopup(strAlertInvalidGuess, intAlertDuration);
        funcAnimateTiles(0);
		return;
	}

	// Response states: 
	// 0 - incorrect
	// 1 - correct
	// 2 - present
	
	var intResponse = [0, 0, 0, 0, 0];
	var intLetterOccurances = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var intLetterOccurancesInGuess = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var intLetterOccurancesAccounted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	for (var i = 0; i < intWordleLength; i++) {
		for (var j = 0; j < strAlphabetLowercase.length; j++) {
			if (strAnswer[i] == strAlphabetLowercase[j]) {
				intLetterOccurances[j]++;				
			}
			
			if (strGuess[i] == strAlphabetLowercase[j]) {
				intLetterOccurancesInGuess[j]++;				
			}
		}
	}
	
	for (var i = 0; i < intWordleLength; i++) {
		if (strGuess[i] == strAnswer[i]) {
			intResponse[i] = 2;
			intLetterOccurancesAccounted[strAlphabetLowercase.indexOf(strAnswer[i])]++;
		}
	}

	for (var i = 0; i < strAlphabetLowercase.length; i++) {
		while (intLetterOccurancesAccounted[i] < funcMin(intLetterOccurances[i], intLetterOccurancesInGuess[i])) {
			for (var j = 0; j < intWordleLength; j++) {
				if (strGuess[j] == strAlphabetLowercase[i] && intResponse[j] == 0) {
					intResponse[j] = 1;
					intLetterOccurancesAccounted[i] += 1;
                    break;
				}
			}
		}
	}

	funcRevealTiles(intResponse, strGuess, intRow, strFormattedGuess);

    intRow++;
    intTile = 0;
}

function funcInitIcons() {
    // Main Menu
    const htmlMenuIcon = document.getElementById("div-icon-menu");
    const htmlMenu = document.getElementById("div-menu");
    const htmlMenuShader = document.getElementById("div-menu-shader");

    htmlMenuIcon.addEventListener("click", () => {
        funcToggleMenu(htmlMenu, htmlMenuShader, htmlMenuIcon);
    });

    htmlMenuShader.addEventListener("click", () => {
        funcToggleMenu(htmlMenu, htmlMenuShader, htmlMenuIcon);
    });

    // Mode Menu

    const htmlModeMenu = document.getElementById("div-mode-menu");
    const htmlShader = document.getElementById("div-mode-menu-shader");

    const htmlModeClassic = document.getElementById("div-mode-classic");
    const htmlModeSprint = document.getElementById("div-mode-sprint");
    const htmlModeBlitz = document.getElementById("div-mode-blitz");
    const htmlModeBlast = document.getElementById("div-mode-blast");

    htmlModeClassic.addEventListener("click", () => {
        funcToggleModeMenu(htmlModeMenu, htmlShader);
        intGameMode = 0;
        funcResetGame();
    });

    htmlModeSprint.addEventListener("click", () => {
        funcToggleModeMenu(htmlModeMenu, htmlShader);
        intGameMode = 1;
        funcResetGame();
    });

    htmlModeBlitz.addEventListener("click", () => {
        funcToggleModeMenu(htmlModeMenu, htmlShader);
        intGameMode = 2;
        funcResetGame();
    });

    htmlModeBlast.addEventListener("click", () => {
        funcToggleModeMenu(htmlModeMenu, htmlShader);
        intGameMode = 3;
        funcResetGame();
    });
}

function funcResetGame() {
    funcReset();
    funcStartInteraction();

    switch (intGameMode) {
        case 0: 
            break;
        case 1: 
            break;
        case 2: 
        case 3: 
            intTime[0] = intBlastTime;
            intervalTimer = setInterval(() => {
                funcDecrementTime();
            }, 100);
            break;
    }
}

function funcNewWord() {
    intAnswerID = funcRandomValueFromRange(0, intAnswersCount - 1);
    strAnswer = strAnswers[intAnswerID];
    document.title = strAnswer;
    intRow = 0;
    intTile = 0;
    intKeyState = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    funcInitBoard();
    funcInitKeyboard();
}

function funcReset() {
    funcNewWord();
    intScore = 0;
}

function funcToggleModeMenu(htmlMenu, htmlShader) {
    if (htmlMenu.classList.contains("div-mode-menu-active")) {
        htmlMenu.classList.remove("div-mode-menu-active");
        htmlShader.classList.remove("div-shader-active");
    } else {
        htmlMenu.classList.add("div-mode-menu-active");
        htmlShader.classList.add("div-shader-active");
    }
}

function funcToggleMenu(htmlMenu, htmlShader, htmlMenuIcon) {
    if (htmlMenu.classList.contains("div-menu-active")) {
        if (htmlMenuIcon != null) htmlMenuIcon.classList.remove("div-icon-active");
        htmlMenu.classList.remove("div-menu-active");
        htmlShader.classList.remove("div-shader-active");
    } else {
        if (htmlMenuIcon != null) htmlMenuIcon.classList.add("div-icon-active");
        htmlMenu.classList.add("div-menu-active");
        htmlShader.classList.add("div-shader-active");
    }
}

function funcUpdateKeys(intResponse, strFormattedGuess) {
    for (var i = 0; i < intWordleLength; i++) {
        const intState = intResponse[i];
        if (intKeyState[strAlphabetLowercase.indexOf(strFormattedGuess[i])] < intState) {
            intKeyState[strAlphabetLowercase.indexOf(strFormattedGuess[i])] = intState;
            funcUpdateKey(strFormattedGuess[i], intState);
        }
    }
}

function funcConfig(intConfigID) {
    switch (intConfigID) {
        case 0:
            break;
    }
}

function funcUpdateStats() {
    const htmlTime = document.getElementById("p-stats-time");
    const htmlScore = document.getElementById("p-stats-score");

    htmlScore.innerHTML = intScore;

    if (intTime[0].toString().length == 2) htmlTime.innerHTML = intTime[0];
    else htmlTime.innerHTML = "0" + intTime[0];
    htmlTime.innerHTML += ":";
    if (intTime[1].toString().length == 2) htmlTime.innerHTML += intTime[1];
    else htmlTime.innerHTML += "0" + intTime[1];
    htmlTime.innerHTML += ":";
    htmlTime.innerHTML += intTime[2];
}

function funcDecrementTime() {
    var intMinutes = intTime[0];
    var intSeconds = intTime[1];
    var intDeciseconds = intTime[2];

    if (intDeciseconds - 1 < 0) {
        if (intSeconds - 1 < 0) {
            if (intMinutes - 1 < 0) {
                funcEndGame();
            } else {
                intMinutes--;
                intSeconds = 59;
                intDeciseconds = 9;
            }
        } else {
            intSeconds--;
            intDeciseconds = 9;
        }
    } else {
        intDeciseconds--;
    }

    intTime[0] = intMinutes;
    intTime[1] = intSeconds;
    intTime[2] = intDeciseconds;

    funcUpdateStats();
}

function funcEndGame() {
    const htmlModeMenu = document.getElementById("div-mode-menu");
    const htmlShader = document.getElementById("div-mode-menu-shader");

    clearInterval(intervalTimer);
    funcToggleModeMenu(htmlModeMenu, htmlShader);
}