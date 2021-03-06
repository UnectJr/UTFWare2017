jQuery(document).ready(function ($) {
	var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
	var transitionsSupported = ($('.csstransitions').length > 0);
	//if browser does not support transitions - use a different event to trigger them
	if (!transitionsSupported) transitionEnd = 'noTransition';

	$(".topnav a").click(function () {
		console.log()
		$('html,body').animate({
				scrollTop: $($(this).attr('href')).offset().top
			},
			'slow');
	});

	$(".button_jam").click(function () {
		$("#gamegambs").click();
	});

	/* 	$(".timeline ul li:last-child").hover(
			function () {
				$(".button_jam").text("Paga Nois");
			},
			function () {
				$(".button_jam").text("Saiba Mais");
			}
		); */
	//should add a loding while the events are organized 

	function SchedulePlan(element) {
		this.element = element;
		this.timeline = this.element.find('.timeline');
		this.timelineItems = this.timeline.find('li');
		this.timelineItemsNumber = this.timelineItems.length;
		this.timelineStart = getScheduleTimestamp(this.timelineItems.eq(0).text());
		//need to store delta (in our case half hour) timestamp
		this.timelineUnitDuration = getScheduleTimestamp(this.timelineItems.eq(1).text()) - getScheduleTimestamp(this.timelineItems.eq(0).text());

		this.eventsWrapper = this.element.find('.events');
		this.eventsGroup = this.eventsWrapper.find('.events-group');
		this.singleEvents = this.eventsGroup.find('.single-event');
		this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();

		this.modal = this.element.find('.event-modal');
		this.modalHeader = this.modal.find('.header');
		this.modalHeaderBg = this.modal.find('.header-bg');
		this.modalBody = this.modal.find('.body');
		this.modalBodyBg = this.modal.find('.body-bg');
		this.modalMaxWidth = 800;
		this.modalMaxHeight = 480;

		this.animating = false;

		this.initSchedule();
	}

	SchedulePlan.prototype.initSchedule = function () {
		this.scheduleReset();
		this.initEvents();
	};

	SchedulePlan.prototype.scheduleReset = function () {
		var mq = this.mq();
		if (mq == 'desktop' && !this.element.hasClass('js-full')) {
			//in this case you are on a desktop version (first load or resize from mobile)
			this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();
			this.element.addClass('js-full');
			this.placeEvents();
			this.element.hasClass('modal-is-open') && this.checkEventModal();
		} else if (mq == 'mobile' && this.element.hasClass('js-full')) {
			//in this case you are on a mobile version (first load or resize from desktop)
			this.element.removeClass('js-full loading');
			this.eventsGroup.children('ul').add(this.singleEvents).removeAttr('style');
			this.eventsWrapper.children('.grid-line').remove();
			this.element.hasClass('modal-is-open') && this.checkEventModal();
		} else if (mq == 'desktop' && this.element.hasClass('modal-is-open')) {
			//on a mobile version with modal open - need to resize/move modal window
			this.checkEventModal('desktop');
			this.element.removeClass('loading');
		} else {
			this.element.removeClass('loading');
		}
	};

	SchedulePlan.prototype.initEvents = function () {
		var self = this;
		var x = 0;
		this.singleEvents.each(function () {

			//create the .event-date element for each event
			if ($(this).data('start') == '13:00') {
				//GAMEJAM
				if ($(this).data('end') == '23:00') {
					var durationLabel = '<span class="event-date">' + '13:00' + ' - ' + '24:00' + '</span>';
				} else if ($(this).data('end') == '17:30' && x == 0) {
					var durationLabel = '<span class="event-date">' + '00:00' + ' - ' + '17:30' + '</span>';
					x = 1;
				} else {
					var durationLabel = '<span class="event-date">' + $(this).data('start') + ' - ' + $(this).data('end') + '</span>';
				}

			} else {
				var durationLabel = '<span class="event-date">' + $(this).data('start') + ' - ' + $(this).data('end') + '</span>';
			}

			if ($(this).data('start') == '14:00') {
				var durationLabel = '<span class="event-date">' + '14:00' + ' - ' + '24:00' + '</span>';
			}
			if ($(this).data('start') == '11:00') {
				var durationLabel = '<span class="event-date">' + '00:00' + ' - ' + '12:00' + '</span>';
			}
			// append label
			$(this).children('a').prepend($(durationLabel));

			//detect click on the event and open the modal
			$(this).on('click', 'a', function (event) {
				event.preventDefault();
				if (!self.animating) self.openModal($(this));
			});
		});

		//close modal window
		this.modal.on('click', '.close', function (event) {
			event.preventDefault();
			if (!self.animating) self.closeModal(self.eventsGroup.find('.selected-event'));
		});
		this.element.on('click', '.cover-layer', function (event) {
			if (!self.animating && self.element.hasClass('modal-is-open')) self.closeModal(self.eventsGroup.find('.selected-event'));
		});
	};

	SchedulePlan.prototype.placeEvents = function () {
		var self = this;
		this.singleEvents.each(function () {
			//place each event in the grid -> need to set top position and height
			var start = getScheduleTimestamp($(this).attr('data-start')),
				duration = getScheduleTimestamp($(this).attr('data-end')) - start;

			var eventTop = self.eventSlotHeight * (start - self.timelineStart) / self.timelineUnitDuration,
				eventHeight = self.eventSlotHeight * duration / self.timelineUnitDuration;

			$(this).css({
				top: (eventTop - 1) + 'px',
				height: (eventHeight + 1) + 'px'
			});
		});

		this.element.removeClass('loading');
	};

	SchedulePlan.prototype.openModal = function (event) {
		var self = this;
		var mq = self.mq();
		this.animating = true;

		//update event name and time
		if (event.find('.event-name').text().split(" ")[0] == 'Minicursos') {
			this.modalHeader.find('.event-name').text(event.find('.event-name').text().split(" ")[0]);
		} else {
			this.modalHeader.find('.event-name').text(event.find('.event-name').text());
		}

		this.modalHeader.find('.event-date').text(event.find('.event-date').text());
		this.modal.attr('data-event', event.parent().attr('data-event'));
		//update event content
		this.modalBody.find('.event-info').load('events/' + event.parent().attr('data-content') + '.html .event-info > *', function (data) {
			//once the event content has been loaded
			self.element.addClass('content-loaded');
		});

		this.element.addClass('modal-is-open');

		setTimeout(function () {
			//fixes a flash when an event is selected - desktop version only
			event.parent('li').addClass('selected-event');
		}, 10);

		if (mq == 'mobile') {
			self.modal.one(transitionEnd, function () {
				self.modal.off(transitionEnd);
				self.animating = false;
			});
		} else {
			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var windowWidth = $(window).width(),
				windowHeight = $(window).height();

			var modalWidth = (windowWidth * .8 > self.modalMaxWidth) ? self.modalMaxWidth : windowWidth * .8,
				modalHeight = (windowHeight * .8 > self.modalMaxHeight) ? self.modalMaxHeight : windowHeight * .8;

			var modalTranslateX = parseInt((windowWidth - modalWidth) / 2 - eventLeft),
				modalTranslateY = parseInt((windowHeight - modalHeight) / 2 - eventTop);

			var HeaderBgScaleY = modalHeight / eventHeight,
				BodyBgScaleX = (modalWidth - eventWidth);

			//change modal height/width and translate it
			self.modal.css({
				top: eventTop + 'px',
				left: eventLeft + 'px',
				height: modalHeight + 'px',
				width: modalWidth + 'px',
			});
			transformElement(self.modal, 'translateY(' + modalTranslateY + 'px) translateX(' + modalTranslateX + 'px)');

			//set modalHeader width
			self.modalHeader.css({
				width: eventWidth + 'px',
			});
			//set modalBody left margin
			self.modalBody.css({
				marginLeft: eventWidth + 'px',
			});

			//change modalBodyBg height/width ans scale it
			self.modalBodyBg.css({
				height: eventHeight + 'px',
				width: '1px',
			});
			transformElement(self.modalBodyBg, 'scaleY(' + HeaderBgScaleY + ') scaleX(' + BodyBgScaleX + ')');

			//change modal modalHeaderBg height/width and scale it
			self.modalHeaderBg.css({
				height: eventHeight + 'px',
				width: eventWidth + 'px',
			});
			transformElement(self.modalHeaderBg, 'scaleY(' + HeaderBgScaleY + ')');

			self.modalHeaderBg.one(transitionEnd, function () {
				//wait for the  end of the modalHeaderBg transformation and show the modal content
				self.modalHeaderBg.off(transitionEnd);
				self.animating = false;
				self.element.addClass('animation-completed');
			});
		}

		//if browser do not support transitions -> no need to wait for the end of it
		if (!transitionsSupported) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
	};

	SchedulePlan.prototype.closeModal = function (event) {
		var self = this;
		var mq = self.mq();

		this.animating = true;

		if (mq == 'mobile') {
			this.element.removeClass('modal-is-open');
			this.modal.one(transitionEnd, function () {
				self.modal.off(transitionEnd);
				self.animating = false;
				self.element.removeClass('content-loaded');
				event.removeClass('selected-event');
			});
		} else {
			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var modalTop = Number(self.modal.css('top').replace('px', '')),
				modalLeft = Number(self.modal.css('left').replace('px', ''));

			var modalTranslateX = eventLeft - modalLeft,
				modalTranslateY = eventTop - modalTop;

			self.element.removeClass('animation-completed modal-is-open');

			//change modal width/height and translate it
			this.modal.css({
				width: eventWidth + 'px',
				height: eventHeight + 'px'
			});
			transformElement(self.modal, 'translateX(' + modalTranslateX + 'px) translateY(' + modalTranslateY + 'px)');

			//scale down modalBodyBg element
			transformElement(self.modalBodyBg, 'scaleX(0) scaleY(1)');
			//scale down modalHeaderBg element
			transformElement(self.modalHeaderBg, 'scaleY(1)');

			this.modalHeaderBg.one(transitionEnd, function () {
				//wait for the  end of the modalHeaderBg transformation and reset modal style
				self.modalHeaderBg.off(transitionEnd);
				self.modal.addClass('no-transition');
				setTimeout(function () {
					self.modal.add(self.modalHeader).add(self.modalBody).add(self.modalHeaderBg).add(self.modalBodyBg).attr('style', '');
				}, 10);
				setTimeout(function () {
					self.modal.removeClass('no-transition');
				}, 20);

				self.animating = false;
				self.element.removeClass('content-loaded');
				event.removeClass('selected-event');
			});
		}

		//browser do not support transitions -> no need to wait for the end of it
		if (!transitionsSupported) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
	}

	SchedulePlan.prototype.mq = function () {
		//get MQ value ('desktop' or 'mobile') 
		var self = this;
		return window.getComputedStyle(this.element.get(0), '::before').getPropertyValue('content').replace(/["']/g, '');
	};

	SchedulePlan.prototype.checkEventModal = function (device) {
		this.animating = true;
		var self = this;
		var mq = this.mq();

		if (mq == 'mobile') {
			//reset modal style on mobile
			self.modal.add(self.modalHeader).add(self.modalHeaderBg).add(self.modalBody).add(self.modalBodyBg).attr('style', '');
			self.modal.removeClass('no-transition');
			self.animating = false;
		} else if (mq == 'desktop' && self.element.hasClass('modal-is-open')) {
			self.modal.addClass('no-transition');
			self.element.addClass('animation-completed');
			var event = self.eventsGroup.find('.selected-event');

			var eventTop = event.offset().top - $(window).scrollTop(),
				eventLeft = event.offset().left,
				eventHeight = event.innerHeight(),
				eventWidth = event.innerWidth();

			var windowWidth = $(window).width(),
				windowHeight = $(window).height();

			var modalWidth = (windowWidth * .8 > self.modalMaxWidth) ? self.modalMaxWidth : windowWidth * .8,
				modalHeight = (windowHeight * .8 > self.modalMaxHeight) ? self.modalMaxHeight : windowHeight * .8;

			var HeaderBgScaleY = modalHeight / eventHeight,
				BodyBgScaleX = (modalWidth - eventWidth);

			setTimeout(function () {
				self.modal.css({
					width: modalWidth + 'px',
					height: modalHeight + 'px',
					top: (windowHeight / 2 - modalHeight / 2) + 'px',
					left: (windowWidth / 2 - modalWidth / 2) + 'px',
				});
				transformElement(self.modal, 'translateY(0) translateX(0)');
				//change modal modalBodyBg height/width
				self.modalBodyBg.css({
					height: modalHeight + 'px',
					width: '1px',
				});
				transformElement(self.modalBodyBg, 'scaleX(' + BodyBgScaleX + ')');
				//set modalHeader width
				self.modalHeader.css({
					width: eventWidth + 'px',
				});
				//set modalBody left margin
				self.modalBody.css({
					marginLeft: eventWidth + 'px',
				});
				//change modal modalHeaderBg height/width and scale it
				self.modalHeaderBg.css({
					height: eventHeight + 'px',
					width: eventWidth + 'px',
				});
				transformElement(self.modalHeaderBg, 'scaleY(' + HeaderBgScaleY + ')');
			}, 10);

			setTimeout(function () {
				self.modal.removeClass('no-transition');
				self.animating = false;
			}, 20);
		}
	};

	var schedules = $('.cd-schedule');
	var objSchedulesPlan = [],
		windowResize = false;

	if (schedules.length > 0) {
		schedules.each(function () {
			//create SchedulePlan objects
			objSchedulesPlan.push(new SchedulePlan($(this)));
		});
	}

	$(window).on('resize', function () {
		if (!windowResize) {
			windowResize = true;
			(!window.requestAnimationFrame) ? setTimeout(checkResize): window.requestAnimationFrame(checkResize);
		}
	});

	$(window).keyup(function (event) {
		if (event.keyCode == 27) {
			objSchedulesPlan.forEach(function (element) {
				element.closeModal(element.eventsGroup.find('.selected-event'));
			});
		}
	});

	function checkResize() {
		objSchedulesPlan.forEach(function (element) {
			element.scheduleReset();
		});
		windowResize = false;
	}

	function getScheduleTimestamp(time) {
		//accepts hh:mm format - convert hh:mm to timestamp
		time = time.replace(/ /g, '');
		var timeArray = time.split(':');
		var timeStamp = parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);
		return timeStamp;
	}

	function transformElement(element, value) {
		element.css({
			'-moz-transform': value,
			'-webkit-transform': value,
			'-ms-transform': value,
			'-o-transform': value,
			'transform': value
		});
	}
});

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function toggleMenu() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}

/* ---- particles.js config ---- */

particlesJS("particles-js", {
	"particles": {
		"number": {
			"value": 150,
			"density": {
				"enable": true,
				"value_area": 800
			}
		},
		"color": {
			"value": "#ffffff"
		},
		"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#000000"
			},
			"polygon": {
				"nb_sides": 5
			},
			"image": {
				"src": "img/github.svg",
				"width": 100,
				"height": 100
			}
		},
		"opacity": {
			"value": 0.5,
			"random": false,
			"anim": {
				"enable": false,
				"speed": 1,
				"opacity_min": 0.1,
				"sync": false
			}
		},
		"size": {
			"value": 3,
			"random": true,
			"anim": {
				"enable": false,
				"speed": 40,
				"size_min": 0.1,
				"sync": false
			}
		},
		"line_linked": {
			"enable": true,
			"distance": 150,
			"color": "#ffffff",
			"opacity": 0.4,
			"width": 1
		},
		"move": {
			"enable": true,
			"speed": 6,
			"direction": "none",
			"random": false,
			"straight": false,
			"out_mode": "out",
			"bounce": false,
			"attract": {
				"enable": false,
				"rotateX": 600,
				"rotateY": 1200
			}
		}
	},
	"interactivity": {
		"detect_on": "canvas",
		"events": {
			"onhover": {
				"enable": true,
				"mode": "repulse"
			},
			"onclick": {
				"enable": true,
				"mode": "push"
			},
			"resize": true
		},
		"modes": {
			"grab": {
				"distance": 140,
				"line_linked": {
					"opacity": 1
				}
			},
			"bubble": {
				"distance": 400,
				"size": 40,
				"duration": 2,
				"opacity": 8,
				"speed": 3
			},
			"repulse": {
				"distance": 200,
				"duration": 0.4
			},
			"push": {
				"particles_nb": 4
			},
			"remove": {
				"particles_nb": 2
			}
		}
	},
	"retina_detect": true
});


/* ---- stats.js config ---- */

var count_particles, stats, update;
stats = new Stats;
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
count_particles = document.querySelector('.js-count-particles');
update = function () {
	stats.begin();
	stats.end();
	if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) {
		count_particles.innerText = window.pJSDom[0].pJS.particles.array.length;
	}
	requestAnimationFrame(update);
};
requestAnimationFrame(update);