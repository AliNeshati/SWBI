/**
* Magnifier.js is a Javascript library enabling magnifying glass effect on an images.
*
* Features
*
* Zoom in / out functionality using mouse wheel
* Setting options via Javascript or data attributes
* Magnified image can be displayed in the lens itself or outside of it in a wrapper
* Attachment to multiple images with single call
* Attachment of user defined functions for thumbnail entering, moving and leaving and image zooming events
* Display loading text while the large image is being loaded, and switch to lens once its loaded
*
* Magnifier.js uses Event.js as a cross-browser event handling wrapper, which is available at
* Github and JSClasses.org:
*
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* Works in Chrome, Firefox, Safari, IE 7, 8, 9 & 10.
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/

var generalCounter=0;
generalCounter++;
console.log("generalCounter: " + generalCounter );
var Graph1 = {};

var Magnifier = function (evt, ImgC , options) {
    "use strict";
	
	var MagCounter=0;
MagCounter++;
console.log("MagCounter: " + MagCounter );

	var RedDot = document.createElement('img');
	RedDot.style.width = '10px';
	RedDot.style.height = '10px';
	RedDot.style.position = "relative";
	RedDot.src = "curs.png";
	RedDot.style.marginTop = "45px";
	RedDot.style.marginLeft = "45px";
	RedDot.style.zIndex  = '2';
	
	var ValuesText = document.createElement('div');
    ValuesText.className = 'magnifier-loader-text';
    ValuesText.innerHTML = "Test Test";
	ValuesText.innerHTML = "Ali";
	ValuesText.style.position = "relative";
	ValuesText.style.zIndex  = '3';
	ValuesText.style.marginTop = "-35px";
	ValuesText.style.marginLeft = "45px";
	ValuesText.style.fontWeight = "bold";
	ValuesText.style.fontSize = "30px";

	var IntrctionArea = "";
	
	
    var gOptions = options || {},
        curThumb = null,
        curData = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
            lensW: 0,
            lensH: 0,
            lensBgX: 0,
            lensBgY: 0,
            largeW: 0,
            largeH: 0,
            largeL: 0,
            largeT: 0,
            zoom: 2,
            zoomMin: 1.1,
            zoomMax: 5,
            mode: 'outside',
            largeWrapperId: (gOptions.largeWrapper !== undefined)
                ? (gOptions.largeWrapper.id || null)
                : null,
            status: 0,
            zoomAttached: false,
            zoomable: (gOptions.zoomable !== undefined)
                ? gOptions.zoomable
                : false,
            onthumbenter: (gOptions.onthumbenter !== undefined)
                ? gOptions.onthumbenter
                : null,
            onthumbmove: (gOptions.onthumbmove !== undefined)
                ? gOptions.onthumbmove
                : null,
            onthumbleave: (gOptions.onthumbleave !== undefined)
                ? gOptions.onthumbleave
                : null,
            onzoom: (gOptions.onzoom !== undefined)
                ? gOptions.onzoom
                : null
        },
        pos = {
            t: 0,
            l: 0,
            x: 0,
            y: 0
        },
        gId = 0,
        status = 0,
        curIdx = '',
        curLens = null,
        curLarge = null,
        gZoom = (gOptions.zoom !== undefined)
                    ? gOptions.zoom
                    : curData.zoom,
        gZoomMin = (gOptions.zoomMin !== undefined)
                    ? gOptions.zoomMin
                    : curData.zoomMin,
        gZoomMax = (gOptions.zoomMax !== undefined)
                    ? gOptions.zoomMax
                    : curData.zoomMax,
        gMode = gOptions.mode || curData.mode,
        data = {},
        inBounds = false,
        isOverThumb = 0,
        getElementsByClass = function (className) {
            var list = [],
                elements = null,
                len = 0,
                pattern = '',
                i = 0,
                j = 0;

            if (document.getElementsByClassName) {
                list = document.getElementsByClassName(className);
            } else {
                elements = document.getElementsByTagName('*');
                len = elements.length;
                pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");

                for (i, j; i < len; i += 1) {
                    if (pattern.test(elements[i].className)) {
                        list[j] = elements[i];
                        j += 1;
                    }
                }
            }

            return list;
        },
        $ = function (selector) {
            var idx = '',
                type = selector.charAt(0),
                result = null;

            if (type === '#' || type === '.') {
                idx = selector.substr(1, selector.length);
            }

            if (idx !== '') {
                switch (type) {
                case '#':
                    result = document.getElementById(idx);
                    break;
                case '.':
                    result = getElementsByClass(idx);
                    break;
                }
            }

            return result;
        },
        createLens = function (thumb, idx) {
            var lens = document.createElement('div');

            lens.id = idx + '-lens';
            lens.className = 'magnifier-loader';

            thumb.parentNode.appendChild(lens);
        },
        updateLensOnZoom = function () {
            curLens.style.left = pos.l + 'px';
            curLens.style.top = pos.t + 'px';
            curLens.style.width = curData.lensW + 'px';
            curLens.style.height = curData.lensH + 'px';
            curLens.style.backgroundPosition = '-' + curData.lensBgX + 'px -' +
                                                curData.lensBgY + 'px';

            curLarge.style.left = '-' + curData.largeL + 'px';
            curLarge.style.top = '-' + curData.largeT + 'px';
            curLarge.style.width = curData.largeW + 'px';
            curLarge.style.height = curData.largeH + 'px';
        },
        updateLensOnLoad = function (idx, thumb, large, largeWrapper) {
							
				
            var lens = $('#' + idx + '-lens'),
                textWrapper = null;
				

            if (data[idx].status === 1) {
                textWrapper = document.createElement('div');
                textWrapper.className = 'magnifier-loader-text';
                lens.className = 'magnifier-loader hidden';

                textWrapper.appendChild(document.createTextNode('Loading...'));
                lens.appendChild(textWrapper);
            } else if (data[idx].status === 2) {
                lens.className = 'magnifier-lens hidden';
                lens.removeChild(lens.childNodes[0]);
                lens.style.background = 'url(' + thumb.src + ') no-repeat 0 0 scroll';

                large.id = idx + '-large';
                large.style.width = data[idx].largeW + 'px';
                large.style.height = data[idx].largeH + 'px';
				large.style.position = 'absolute';
				large.style.zIndex = 1;
                large.className = 'magnifier-large hidden';

                if (data[idx].mode === 'inside') {
                    lens.appendChild(large);
                } else {
                    largeWrapper.appendChild(large);
                }
            }

            lens.style.width = data[idx].lensW + 'px';
            lens.style.height = data[idx].lensH + 'px';
        },
        getMousePos = function () {
            var xPos = pos.x - curData.x,
                yPos = pos.y - curData.y,
                t    = 0,
                l    = 0;
				
				//New Ali
				xPos = pos.x;
				yPos = pos.y;

            inBounds = (
                xPos < 0 ||
                yPos < 0 ||
                xPos > curData.w ||
                yPos > curData.h
            )
                ? false
                : true;

            l = xPos - (curData.lensW / 2);
            t = yPos - (curData.lensH / 2);
			
			//console.log("xPos: " + xPos);
			//console.log("yPos: " + yPos);
			//console.log("curData.lensW: " + curData.lensW);
			//console.log("curData.lensH: " + curData.lensH);
			//console.log("l: " + l);
			//console.log("t: " + t);

            if (curData.mode !== 'inside') {
                if (xPos < curData.lensW / 2) {
                    l = 0;
                }

                if (yPos < curData.lensH / 2) {
                    t = 0;
                }

                if (xPos - curData.w + (curData.lensW / 2) > 0) {
                    l = curData.w - (curData.lensW + 2);
                }

                if (yPos - curData.h + (curData.lensH / 2) > 0) {
                    t = curData.h - (curData.lensH + 2);
                }
            }

            pos.l = Math.round(l);
            pos.t = Math.round(t);
			
			//console.log("pos.l : " + pos.l);
			//console.log("pos.t : " + pos.t);

            curData.lensBgX = pos.l + 1;
            curData.lensBgY = pos.t + 1;

            if (curData.mode === 'inside') {
				
			//Ali New
			var newL = Math.round(xPos * (curData.zoom - (curData.lensW / curData.w)));
			var newT = Math.round(yPos * (curData.zoom - (curData.lensH / curData.h)));
				

			if(((0 < xPos && xPos < 150) && (0 < yPos && yPos < 150)))
			{
				if(IntrctionArea == "dl")
				{
					//console.log("dl");
					newL = newL;  
					newT = newT + 350;
				}
				else if(IntrctionArea == "ur")
				{
					//console.log("ur");
					newL = newL + 350;  
					newT = newT;
				}
				
			}
			else if(((150 < xPos && xPos < 300) && (0 < yPos && yPos < 150)))
			{
				if(IntrctionArea == "dr")
				{
					//console.log("dr");
					newL = newL;  
					newT = newT + 500;
					
				}
				else if(IntrctionArea == "ul")
				{
					//console.log("ul");
					newL = newL - 460;  
					newT = newT;
					
				}
			}
			
			
			
                curData.largeL = newL;
                curData.largeT = newT;
				
				
				
				//console.log("RRRRRREEEEEEEESSSSSSSSSSSUUUUUULLLLLLLLTTTTTTT");
				//console.log("curData.largeL : " + curData.largeL);
				//console.log("curData.largeT : " + curData.largeT);
				
				//console.log("curData.lensW : " + curData.lensW);
				//console.log("curData.w : " + curData.w);
				//console.log("curData.lensH : " + curData.lensH);
				//console.log("curData.h : " + curData.h);
				
            } else {
				
                curData.largeL = Math.round(curData.lensBgX * curData.zoom * (curData.largeWrapperW / curData.w));
                curData.largeT = Math.round(curData.lensBgY * curData.zoom * (curData.largeWrapperH / curData.h));
            }
        },
        zoomInOut = function (e) {
            var delta = (e.wheelDelta > 0 || e.detail < 0) ? 0.1 : -0.1,
                handler = curData.onzoom,
                multiplier = 1,
                w = 0,
                h = 0;

            if (e.preventDefault) {
                e.preventDefault();
            }

            e.returnValue = false;

            curData.zoom = Math.round((curData.zoom + delta) * 10) / 10;

            if (curData.zoom >= curData.zoomMax) {
                curData.zoom = curData.zoomMax;
            } else if (curData.zoom >= curData.zoomMin) {
                curData.lensW = Math.round(curData.w / curData.zoom);
                curData.lensH = Math.round(curData.h / curData.zoom);

                if (curData.mode === 'inside') {
                    w = curData.w;
                    h = curData.h;
                } else {
                    w = curData.largeWrapperW;
                    h = curData.largeWrapperH;
                    multiplier = curData.largeWrapperW / curData.w;
                }

                curData.largeW = Math.round(curData.zoom * w);
                curData.largeH = Math.round(curData.zoom * h);

                getMousePos();
                updateLensOnZoom();

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y,
                        zoom: Math.round(curData.zoom * multiplier * 10) / 10,
                        w: curData.lensW,
                        h: curData.lensH
                    });
                }
            } else {
                curData.zoom = curData.zoomMin;
            }
        },
        onThumbEnter = function () {
            curData = data[curIdx];
            curLens = $('#' + curIdx + '-lens');

            if (curData.status === 2) {
                curLens.className = 'magnifier-lens';

                if (curData.zoomAttached === false) {
                    if (curData.zoomable !== undefined && curData.zoomable === true) {
                        evt.attach('mousewheel', curLens, zoomInOut);

                        if (window.addEventListener) {
                            curLens.addEventListener('DOMMouseScroll', function (e) {
                                zoomInOut(e);
                            });
                        }
                    }

                    curData.zoomAttached = true;
                }

                curLarge = $('#' + curIdx + '-large');
                curLarge.className = 'magnifier-large';
				curLens.appendChild(RedDot);
				curLens.appendChild(ValuesText);
				
            } else if (curData.status === 1) {
                curLens.className = 'magnifier-loader';
            }
        },
        onThumbLeave = function () {
            if (curData.status > 0) {
                var handler = curData.onthumbleave;

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y
                    });
                }

                if (curLens.className.indexOf('hidden') === -1) {
                    curLens.className += ' hidden';
                    curThumb.className = curData.thumbCssClass;

                    if (curLarge !== null) {
                        curLarge.className += ' hidden';
                    }
                }
            }
        },
        move = function () {
            if (status !== curData.status) {
                onThumbEnter();
            }

            if (curData.status > 0) {
                curThumb.className = curData.thumbCssClass + ' opaque';

                if (curData.status === 1) {
                    curLens.className = 'magnifier-loader';
                } else if (curData.status === 2) {
                    curLens.className = 'magnifier-lens';
                    curLarge.className = 'magnifier-large';
                    curLarge.style.left = '-' + (curData.largeL) + 'px';
                    curLarge.style.top = '-' + (curData.largeT) + 'px';
					
					
					//console.log("SSSSSS");
					//console.log("curLarge.style.left * largeL: -" + curData.largeL);
					//console.log("curLens.style.top * largeT: -" + curData.largeT);
                }

				//console.log("OOOO");
				//console.log("curLens.style.left * pos.l : " + pos.l);
				//console.log("curLens.style.top * pos.t : " + pos.t);
				//console.log("curLens.style.backgroundPosition * curData.lensBgX : " + curData.lensBgX);
				//console.log("curLens.style.backgroundPosition * curData.lensBgY : " + curData.lensBgY);
				//ValuesText.innerHTML = pos.l;
                curLens.style.left = (pos.l) + 'px';
                curLens.style.top = pos.t + 'px';
                curLens.style.backgroundPosition = '-' +
                                                curData.lensBgX + 'px -' +
                                                curData.lensBgY + 'px';

                var handler = curData.onthumbmove;

                if (handler !== null) {
                    handler({
                        thumb: curThumb,
                        lens: curLens,
                        large: curLarge,
                        x: pos.x,
                        y: pos.y
                    });
                }
            }

            status = curData.status;
        },
        setThumbData = function (thumb, thumbData) {
            var thumbBounds = thumb.getBoundingClientRect(),
                w = 0,
                h = 0;

            thumbData.x = thumbBounds.left;
            thumbData.y = thumbBounds.top;
            thumbData.w = Math.round(thumbBounds.right - thumbData.x);
            thumbData.h = Math.round(thumbBounds.bottom - thumbData.y);

            thumbData.lensW = Math.round(thumbData.w / thumbData.zoom);
            thumbData.lensH = Math.round(thumbData.h / thumbData.zoom);

            if (thumbData.mode === 'inside') {
                w = thumbData.w;
                h = thumbData.h;
            } else {
                w = thumbData.largeWrapperW;
                h = thumbData.largeWrapperH;
            }

            thumbData.largeW = Math.round(thumbData.zoom * w);
            thumbData.largeH = Math.round(thumbData.zoom * h);
        };

    this.attach = function (options) {
        if (options.thumb === undefined) {
            throw {
                name: 'Magnifier error',
                message: 'Please set thumbnail',
                toString: function () {return this.name + ": " + this.message; }
            };
        }

        var thumb = $(options.thumb),
            i = 0;

        if (thumb.length !== undefined) {
            for (i; i < thumb.length; i += 1) {
                options.thumb = thumb[i];
                this.set(options);
            }
        } else {
            options.thumb = thumb;
            this.set(options);
        }
    };

    this.setThumb = function (thumb) {
        curThumb = thumb;
    };

    this.set = function (options) {
        if (data[options.thumb.id] !== undefined) {
            curThumb = options.thumb;
            return false;
        }

        var thumbObj    = new Image(),
            largeObj    = new Image(),
            thumb       = options.thumb,
            idx         = thumb.id,
            zoomable    = null,
            largeUrl    = null,
            largeWrapper = (
                $('#' + options.largeWrapper) ||
                $('#' + thumb.getAttribute('data-large-img-wrapper')) ||
                $('#' + curData.largeWrapperId)
            ),
            zoom = options.zoom || thumb.getAttribute('data-zoom') || gZoom,
            zoomMin = options.zoomMin || thumb.getAttribute('data-zoom-min') || gZoomMin,
            zoomMax = options.zoomMax || thumb.getAttribute('data-zoom-max') || gZoomMax,
            mode = options.mode || thumb.getAttribute('data-mode') || gMode,
            onthumbenter = (options.onthumbenter !== undefined)
                        ? options.onthumbenter
                        : curData.onthumbenter,
            onthumbleave = (options.onthumbleave !== undefined)
                        ? options.onthumbleave
                        : curData.onthumbleave,
            onthumbmove = (options.onthumbmove !== undefined)
                        ? options.onthumbmove
                        : curData.onthumbmove,
            onzoom = (options.onzoom !== undefined)
                        ? options.onzoom
                        : curData.onzoom;

        if (options.large === undefined) {
            largeUrl = (options.thumb.getAttribute('data-large-img-url') !== null)
                            ? options.thumb.getAttribute('data-large-img-url')
                            : options.thumb.src;
        } else {
            largeUrl = options.large;
        }

        if (largeWrapper === null && mode !== 'inside') {
            throw {
                name: 'Magnifier error',
                message: 'Please specify large image wrapper DOM element',
                toString: function () {return this.name + ": " + this.message; }
            };
        }

        if (options.zoomable !== undefined) {
            zoomable = options.zoomable;
        } else if (thumb.getAttribute('data-zoomable') !== null) {
            zoomable = (thumb.getAttribute('data-zoomable') === 'true');
        } else if (curData.zoomable !== undefined) {
            zoomable = curData.zoomable;
        }

        if (thumb.id === '') {
            idx = thumb.id = 'magnifier-item-' + gId;
            gId += 1;
        }

        createLens(thumb, idx);

        data[idx] = {
            zoom: zoom,
            zoomMin: zoomMin,
            zoomMax: zoomMax,
            mode: mode,
            zoomable: zoomable,
            thumbCssClass: thumb.className,
            zoomAttached: false,
            status: 0,
            largeUrl: largeUrl,
            largeWrapperId: mode === 'outside' ? largeWrapper.id : null,
            largeWrapperW: mode === 'outside' ? largeWrapper.offsetWidth : null,
            largeWrapperH: mode === 'outside' ? largeWrapper.offsetHeight : null,
            onzoom: onzoom,
            onthumbenter: onthumbenter,
            onthumbleave: onthumbleave,
            onthumbmove: onthumbmove
        };

        evt.attach('touchstart', thumb, function (e, src) {
			//console.log("Start");
			
            if (curData.status !== 0) {
                onThumbLeave();
            }

            curIdx = src.id;
            curThumb = src;
			
			//console.log("curIdx: " + curIdx);
			//console.log("curThumb: " + curThumb);

            onThumbEnter(src);

            setThumbData(curThumb, curData);

			//Ali New
            pos.x = e.touches[0].clientX;
            pos.y = e.touches[0].clientY;
			
			//console.log("e: " + e);
			//console.log("e.X: " + e.touches[0].clientX);
			//console.log("e.Y: " + e.touches[0].clientY);
			//console.log("pos.x: " + pos.x);
			//console.log("pos.y: " + pos.y);

            getMousePos();
            move();

            var handler = curData.onthumbenter;

            if (handler !== null) {
                handler({
                    thumb: curThumb,
                    lens: curLens,
                    large: curLarge,
                    x: pos.x,
                    y: pos.y
                });
            }
        }, false);

        evt.attach('touchmove', thumb, function (e, src) {
            isOverThumb = 1;
        });

        evt.attach('load', thumbObj, function () {
            data[idx].status = 1;

            setThumbData(thumb, data[idx]);
            updateLensOnLoad(idx);

            evt.attach('load', largeObj, function () {
                data[idx].status = 2;
                updateLensOnLoad(idx, thumb, largeObj, largeWrapper);
            });

            largeObj.src = data[idx].largeUrl;
        });

        thumbObj.src = thumb.src;
    };

    evt.attach('touchmove', document, function (e) {
        pos.x = (e.touches[0].clientX);
        pos.y = (e.touches[0].clientY);
		
		
		//Ali New
		var CurX = e.touches[0].clientX;
		var CurY = e.touches[0].clientY;
		var text = CurX + " - " + CurY;
		//ValuesText.innerHTML = text;
		ValuesText.innerHTML = "";
		
		IntrctionArea = "-";
		
		if(((0 < CurX && CurX < 150) && (0 < CurY && CurY < 150)))
		{
			pos.x = (e.touches[0].clientX + 150);
		    pos.y = e.touches[0].clientY;
			IntrctionArea = "ul";
		}
		else if(((150 < CurX && CurX < 300) && (0 < CurY && CurY < 150)))
		{
			pos.x = (e.touches[0].clientX - 150);
		    pos.y = e.touches[0].clientY;
			IntrctionArea = "ur";
		}
		else if(((0 < CurX && CurX < 150) && (150 < CurY && CurY < 300)))
		{
			pos.x = (e.touches[0].clientX);
		    pos.y = (e.touches[0].clientY-150);
			IntrctionArea = "dl";
		}
		else if(((150 < CurX && CurX < 300) && (150 < CurY && CurY < 300)))
		{
			pos.x = (e.touches[0].clientX);
		    pos.y = (e.touches[0].clientY-150);
			IntrctionArea = "dr";
		}
		
		if(((30 < CurX && CurX < 45) && (60 < CurY && CurY < 80)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((60 < CurX && CurX < 70) && (60 < CurY && CurY < 75)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((84 < CurX && CurX < 98) && (90 < CurY && CurY < 107)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		else if(((111 < CurX && CurX < 128) && (102 < CurY && CurY < 118)))
		{
			ValuesText.innerHTML = 22222;
		}
		
		//ValuesText.innerHTML = IntrctionArea;
		
		//console.log("MMMMMMMMMMMMMMMOOOOOOOOOOOOOOOOOOVVVVVVVVVVVVEEEEEEEEEEEEE (New POSITION - SHIFTED)");
		//console.log("Area : " + IntrctionArea);
		//console.log("pos.x = " + pos.x);
		//console.log("pos.y =" + pos.y);
		//console.log("GET MOUSE POSSITION FUNCTION");
		//console.log("curData.x = " + curData.x);
		//console.log("curData.y =" + curData.y);
		

        getMousePos();

        if (inBounds === true) {
            move();
        } else {
            if (isOverThumb !== 0) {
                onThumbLeave();
            }

            isOverThumb = 0;
        }
    }, false);

    evt.attach('scroll', window, function () {
        if (curThumb !== null) {
            setThumbData(curThumb, curData);
        }
    });
};