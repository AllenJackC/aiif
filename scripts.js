/* Default variables */
var isGoing = false; //Animations are not ongoing
var awaitingButtons = false; //Not waiting for button inputs
var awaitingInitialInput = true; //Waiting for initial input
var initialScrawl; //Blank interval variable for initial text
var prevSection; //There is no previous section
var initialCounter = 0; //Count how many times interval has gone through
var infiniteScroll;

/* Extend addClass to accept callbacks */
var oAddClass = $.fn.addClass;
$.fn.addClass = function() {
    for (var i in arguments) {
        var arg = arguments[i];
        if (!!(arg && arg.constructor && arg.call && arg.apply)) {
            arg();
            delete arg;
        }
    }
    return oAddClass.apply(this, arguments);
}

/* Recurring function to scroll to the bottom of the window */
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

/* Turn event listeners for the page on and off */
function toggleInput() {
    if (!awaitingButtons) {
        $(window).on('keypress click tap touchstart', function(e) {
            if (awaitingInitialInput) {
                $('.optional').removeClass('hidden');
                nextUp($('#wait-input'));
                awaitingInitialInput = false;
                clearInterval(initialScrawl);
            } else {
                 if (!$(e.target).hasClass('slider') && $(e.target).attr('id') != 'accessible' && $(e.target).attr('id') != 'accessible-label' && !$(e.target).is('a')) nextUp($('.hidden:first'));
            }
        });
    } else {
        $(window).unbind('keypress');
        $(window).unbind('click');
    }
}

/* Primary function for advancing the text and displaying buttons */
function nextUp(curEl) {
    //If the animation isn't currently going and the current element is not empty
    if (!isGoing && curEl.length > 0) {
        //If the current element is text and we aren't waiting for button selections
        if (curEl.is('p')) {
            isGoing = true; //Animations are ongoing
            curEl.removeClass('hidden'); //Remove the hidden class
            //If there's a previous section, remove the cursor from that text
            if (prevSection) prevSection.text(prevSection.text().slice(0, -1));

            /* Typewriter effect */
            curEl.typewrite({
                'delay': 30,
                'extra_char': '<span class="cursor">▓</span>',
                'callback': function() {
                    prevSection = curEl; //Set the previous section as the current text
                    isGoing = false; //Animation finished
                    //If current text is part of a collection of multiple paths, disable the other options
                    $('[data-disable*="' + curEl.attr('data-target') + '"]').removeClass('hidden').css('display', 'none');
                    //If the next element is a question, show it right away
                    if (curEl.hasClass('question')) {
                        curEl = $('.hidden:first');
                        var buttonContainer = curEl.closest('.button-container'); //Identify the button container
                        awaitingButtons = true; //Waiting for button selections
                        toggleInput(); //Disable general inputs while waiting for buttons
                        buttonContainer.removeClass('hidden').css('display', 'grid'); //Show the button container
                        //If the page is in accessibility mode, fade the buttons in
                        if ($('body').hasClass('accessible')) {
                            buttonContainer.find('button').each(function(i) {
                                var buttonAnim = $(this);
                                setTimeout(function() {
                                    buttonAnim.addClass('fade-in');
                                }, 100 * i);
                            }).promise().done(function() {
                                isGoing = false; //Once loop through buttons is done, animations are done
                            });
                            //If the page is NOT in accessibility mode, flicker the buttons in
                        } else {
                            buttonContainer.find('button').each(function(i) {
                                var buttonAnim = $(this);
                                setTimeout(function() {
                                    buttonAnim.addClass('flicker');
                                }, 100 * i);
                            }).promise().done(function() {
                                isGoing = false; //Once loop through buttons is done, animations are done
                            });
                        }
                    //If the next element is a link, show it right away   
                    } else if (curEl.hasClass('link')) {
						curEl = $('.hidden:first');
						//If the page is in accessibility mode, fade the link in
						if ($('body').hasClass('accessible')) {
							curEl.removeClass('hidden');
							curEl.addClass('fade-in');
							isGoing = false; //Animations are done
							//If the page is NOT in accessibility mode, flicker the link in
						} else {
							curEl.removeClass('hidden');
							curEl.addClass('flicker');
							isGoing = false; //Animations are done
						}					
					//If it's the last message, show last few messages, disable inputs and enable scrolling
					} else if (curEl.hasClass('last')) {
                        //If there's a previous section, remove the cursor from that text
                        if (prevSection) prevSection.text(prevSection.text().slice(0, -1));
                        //If the page is in accessibility mode, fade the links in
                        if ($('body').hasClass('accessible')) {
                            $('.ending').each(function(i) {
                                var linkAnim = $(this);
                                setTimeout(function() {
                                    linkAnim.removeClass('hidden');
                                    linkAnim.addClass('fade-in');
                                }, 100 * i);
                            }).promise().done(function() {
                                setTimeout(function() {
									clearInterval(infiniteScroll);
									$('body').css('overflow-y', 'auto'); //Once loop through links is done, enable scrolling
								}, 700);
                            });
                            //If the page is NOT in accessibility mode, flicker the links in
                        } else {
                            $('.ending').each(function(i) {
                                var linkAnim = $(this);
                                setTimeout(function() {
                                    linkAnim.removeClass('hidden');
                                    linkAnim.addClass('flicker');
                                }, 100 * i);
                            }).promise().done(function() {
                                setTimeout(function() {
									clearInterval(infiniteScroll);
									$('body').css('overflow-y', 'auto'); //Once loop through links is done, enable scrolling
									awaitingButtons = true; //Disable click event listeners
									toggleInput(); //Disable click event listeners
								}, 700);
                            });
                        }
                    } else {
                        isGoing = false; //Animations done
                    }
                }
            });
            //If the current element is a link
        } else if (curEl.is('a')) {
            //If the page is in accessibility mode, fade the link in
            if ($('body').hasClass('accessible')) {
                curEl.removeClass('hidden');
                curEl.addClass('fade-in');
                isGoing = false; //Animations are done
                //If the page is NOT in accessibility mode, flicker the link in
            } else {
                curEl.removeClass('hidden');
                curEl.addClass('flicker');
                isGoing = false; //Animations are done
            }
            //If the current element is a loading animation
        } else if (curEl.is('.loader')) {
            isGoing = true; //Animations are ongoing
            curEl.removeClass('hidden'); //Show the loading animation
            //After three seconds, show advance the text
            setTimeout(function() {
                curEl.hide();
                curEl = $('.hidden:first');
                curEl.removeClass('hidden'); //Remove the hidden class
                //If there's a previous section, remove the cursor from that text
                if (prevSection) prevSection.text(prevSection.text().slice(0, -1));

                /* Typewriter effect */
                curEl.typewrite({
                    'delay': 30,
                    'extra_char': '<span class="cursor">▓</span>',
                    'callback': function() {
                        prevSection = curEl; //Set the previous section as the current text
                        isGoing = false; //Animation finished
                        //If current text is part of a collection of multiple paths, disable the other options
                        $('[data-disable*="' + curEl.attr('data-target') + '"]').removeClass('hidden').css('display', 'none');
						//If the next element is a link, show it right away   
						if (curEl.hasClass('link')) {
							curEl = $('.hidden:first');
							//If the page is in accessibility mode, fade the link in
							if ($('body').hasClass('accessible')) {
								curEl.removeClass('hidden');
								curEl.addClass('fade-in');
								isGoing = false; //Animations are done
								//If the page is NOT in accessibility mode, flicker the link in
							} else {
								curEl.removeClass('hidden');
								curEl.addClass('flicker');
								isGoing = false; //Animations are done
							}			
						}
					}
                });
            }, 5000);
        } else {
			var buttonContainer = curEl.closest('.button-container'); //Identify the button container
			awaitingButtons = true; //Waiting for button selections
			toggleInput(); //Disable general inputs while waiting for buttons
			buttonContainer.removeClass('hidden').css('display', 'grid'); //Show the button container
			//If the page is in accessibility mode, fade the buttons in
			if ($('body').hasClass('accessible')) {
				buttonContainer.find('button').each(function(i) {
					var buttonAnim = $(this);
					setTimeout(function() {
						buttonAnim.addClass('fade-in');
					}, 100 * i);
				}).promise().done(function() {
					isGoing = false; //Once loop through buttons is done, animations are done
				});
				//If the page is NOT in accessibility mode, flicker the buttons in
			} else {
				buttonContainer.find('button').each(function(i) {
					var buttonAnim = $(this);
					setTimeout(function() {
						buttonAnim.addClass('flicker');
					}, 100 * i);
				}).promise().done(function() {
					isGoing = false; //Once loop through buttons is done, animations are done
				});
			}
		}
    }
}

$(document).ready(function() {
    infiniteScroll = setInterval(scrollToBottom, 10); //Scroll to bottom of the page every 10 milliseconds

    /* Toggle accessibility mode on load and on click */
    if ($('#accessible').is(':checked')) {
		$('body').toggleClass('crt');
        $('body').toggleClass('accessible');
    }
    $('#accessible').on('click', function() {
		$('body').toggleClass('crt');
        $('body').toggleClass('accessible');
    });

    /* If a button is clicked, change it's style, advance relevant text and disable unused text */
    $('button').on('click', function() {
        var buttonContainer = $(this).closest('.button-container'); //Identify button container
        //If only one option is available, remove the active class from all other buttons
        if (buttonContainer.hasClass('multiselect') == false) buttonContainer.find('button').removeClass('active');
        $(this).toggleClass('active'); //Enable to active class
        //If there is at least one button selected, enable the submit button
        if (buttonContainer.find('.active').length > 0) {
            buttonContainer.find('.submit').removeClass('insufficient');
            //If there are no buttons selected, disable the submit button
        } else {
            buttonContainer.find('.submit').addClass('insufficient');
        }
    });

    /* If a single selection button is clicked, show associated text */
    $('.single button').on('click', function() {
        var textID = $(this).attr('id'); //Get the stored association in the button
        nextUp($('[data-target="' + textID + '"]')); //Target the associated text
        $(this).closest('.button-container').find('button').addClass('disabled'); //Disable interactions with all buttons on the same level
        awaitingButtons = false; //No longer waiting for button inputs
        toggleInput(); //Re-enable window inputs
    });

    /* If a submit button is pressed, advance the text */
    $('.submit').on('click', function() {
        nextUp($('.hidden:first')); //Advance the text
        $(this).closest('.button-container').find('button').addClass('disabled'); //Disable interactions with all buttons on the same level
        awaitingButtons = false; //No longer waiting for button inputs
        toggleInput(); //Re-enable window inputs
    });

    /* Special button behaviour for trick question */
    $('#trick-question button').on('click', function() {
        $('#trick-answer').text('Wait! I didn’t say that, I said "' + $(this).text() + '"');
		if ($('body').hasClass('accessible')) {
			$(this).addClass('slow-fade-in').text('You’re right, that is woke garbage.');
		} else {
			$(this).addClass('slow-flicker').text('You’re right, that is woke garbage.');
		}
    });

    /* Initial run */
    setTimeout(function() {
        nextUp($('.hidden:first'));
        toggleInput();
        initialScrawl = setInterval(function() {
            if (initialCounter < 5) {
                initialCounter++;
                nextUp($('.hidden:first'));
            }
        }, 5000);
    }, 3000);
});