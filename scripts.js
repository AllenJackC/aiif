/* Default variables */
var isGoing = false; //Animations are not ongoing
var awaitingButtons = false; //Not waiting for button inputs
var prevSection; //There is no previous section

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
		$(window).on('keypress', function() {
			nextUp($('.hidden:first'));
		});
		$(window).click(function(e) {
			if (!$(e.target).hasClass('slider') && $(e.target).attr('id') != 'accessible' && !$(e.target).is('a')) nextUp($('.hidden:first'));
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
					if (curEl.parent().is('.multiple-paths')) curEl.siblings().removeClass('hidden').css('display', 'none');
				}
			});
		} else {
			var buttonContainer = curEl.closest('.button-container'); //Identify the button container
			isGoing = true; //Animations are ongoing
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
	setInterval(scrollToBottom, 10); //Scroll to bottom of the page every 10 milliseconds

	/* Toggle accessibility mode on load and on click */
	if ($('#accessible').is(':checked')) {
		$('body').toggleClass('crt');
		$('body').toggleClass('accessible');
	}
	$('#accessible').click(function() {
		$('body').toggleClass('crt');
		$('body').toggleClass('accessible');
	});

	toggleInput(); //If not waiting for button selections, any keypress, click or tap will advance the text

	/* If a button is clicked, change it's style, advance relevant text and disable unused text */
	$('button').click(function() {
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
	$('.single button').click(function() {
		var textID = $(this).attr('for-text'); //Get the stored association in the button
		nextUp($('#' + textID)); //Target the associated text
		$(this).closest('.button-container').find('button').addClass('disabled'); //Disable interactions with all buttons on the same level
		awaitingButtons = false; //No longer waiting for button inputs
		toggleInput(); //Re-enable window inputs
	});

	/* If a submit button is pressed, advance the text */
	$('.submit').click(function() {
		nextUp($('.hidden:first')); //Advance the text
		$(this).closest('.button-container').find('button').addClass('disabled'); //Disable interactions with all buttons on the same level
		awaitingButtons = false; //No longer waiting for button inputs
		toggleInput(); //Re-enable window inputs
	});
});