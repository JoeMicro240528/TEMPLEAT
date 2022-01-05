1
function isIn(needle, haystack) { 

 2
  return haystack.indexOf(needle) >= 0; 

 3
} 

 4

 

 5
function extend(custom, defaults) { 

 6
  for (const key in defaults) { 

 7
    if (custom[key] == null) { 

 8
      const value = defaults[key]; 

 9
      custom[key] = value; 

 10
    } 

 11
  } 

 12
  return custom; 

 13
} 

 14

 

 15
function isMobile(agent) { 

 16
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent); 

 17
} 

 18

 

 19
function createEvent(event, bubble = false, cancel = false, detail = null) { 

 20
  let customEvent; 

 21
  if (document.createEvent != null) { // W3C DOM 

 22
    customEvent = document.createEvent('CustomEvent'); 

 23
    customEvent.initCustomEvent(event, bubble, cancel, detail); 

 24
  } else if (document.createEventObject != null) { // IE DOM < 9 

 25
    customEvent = document.createEventObject(); 

 26
    customEvent.eventType = event; 

 27
  } else { 

 28
    customEvent.eventName = event; 

 29
  } 

 30

 

 31
  return customEvent; 

 32
} 

 33

 

 34
function emitEvent(elem, event) { 

 35
  if (elem.dispatchEvent != null) { // W3C DOM 

 36
    elem.dispatchEvent(event); 

 37
  } else if (event in (elem != null)) { 

 38
    elem[event](); 

 39
  } else if (`on${event}` in (elem != null)) { 

 40
    elem[`on${event}`](); 

 41
  } 

 42
} 

 43

 

 44
function addEvent(elem, event, fn) { 

 45
  if (elem.addEventListener != null) { // W3C DOM 

 46
    elem.addEventListener(event, fn, false); 

 47
  } else if (elem.attachEvent != null) { // IE DOM 

 48
    elem.attachEvent(`on${event}`, fn); 

 49
  } else { // fallback 

 50
    elem[event] = fn; 

 51
  } 

 52
} 

 53

 

 54
function removeEvent(elem, event, fn) { 

 55
  if (elem.removeEventListener != null) { // W3C DOM 

 56
    elem.removeEventListener(event, fn, false); 

 57
  } else if (elem.detachEvent != null) { // IE DOM 

 58
    elem.detachEvent(`on${event}`, fn); 

 59
  } else { // fallback 

 60
    delete elem[event]; 

 61
  } 

 62
} 

 63

 

 64
function getInnerHeight() { 

 65
  if ('innerHeight' in window) { 

 66
    return window.innerHeight; 

 67
  } 

 68

 

 69
  return document.documentElement.clientHeight; 

 70
} 

 71

 

 72
// Minimalistic WeakMap shim, just in case. 

 73
const WeakMap = window.WeakMap || window.MozWeakMap || 

 74
class WeakMap { 

 75
  constructor() { 

 76
    this.keys = []; 

 77
    this.values = []; 

 78
  } 

 79

 

 80
  get(key) { 

 81
    for (let i = 0; i < this.keys.length; i++) { 

 82
      const item = this.keys[i]; 

 83
      if (item === key) { 

 84
        return this.values[i]; 

 85
      } 

 86
    } 

 87
    return undefined; 

 88
  } 

 89

 

 90
  set(key, value) { 

 91
    for (let i = 0; i < this.keys.length; i++) { 

 92
      const item = this.keys[i]; 

 93
      if (item === key) { 

 94
        this.values[i] = value; 

 95
        return this; 

 96
      } 

 97
    } 

 98
    this.keys.push(key); 

 99
    this.values.push(value); 

 100
    return this; 

 101
  } 

 102
}; 

 103

 

 104
// Dummy MutationObserver, to avoid raising exceptions. 

 105
const MutationObserver = 

 106
  window.MutationObserver || window.WebkitMutationObserver || 

 107
  window.MozMutationObserver || 

 108
  class MutationObserver { 

 109
    constructor() { 

 110
      if (typeof console !== 'undefined' && console !== null) { 

 111
        console.warn('MutationObserver is not supported by your browser.'); 

 112
        console.warn( 

 113
          'WOW.js cannot detect dom mutations, please call .sync() after loading new content.' 

 114
        ); 

 115
      } 

 116
    } 

 117

 

 118
    static notSupported = true; 

 119

 

 120
    observe() {} 

 121
  }; 

 122

 

 123
// getComputedStyle shim, from http://stackoverflow.com/a/21797294 

 124
const getComputedStyle = window.getComputedStyle || 

 125
function getComputedStyle(el) { 

 126
  const getComputedStyleRX = /(\-([a-z]){1})/g; 

 127
  return { 

 128
    getPropertyValue(prop) { 

 129
      if (prop === 'float') { prop = 'styleFloat'; } 

 130
      if (getComputedStyleRX.test(prop)) { 

 131
        prop.replace(getComputedStyleRX, (_, _char) => _char.toUpperCase()); 

 132
      } 

 133
      const { currentStyle } = el; 

 134
      return (currentStyle != null ? currentStyle[prop] : void 0) || null; 

 135
    }, 

 136
  }; 

 137
}; 

 138

 

 139
export default class WOW { 

 140
  defaults = { 

 141
    boxClass: 'wow', 

 142
    animateClass: 'animated', 

 143
    offset: 0, 

 144
    mobile: true, 

 145
    live: true, 

 146
    callback: null, 

 147
    scrollContainer: null, 

 148
    resetAnimation: true, 

 149
  }; 

 150

 

 151
  constructor(options = {}) { 

 152
    this.start = this.start.bind(this); 

 153
    this.resetAnimation = this.resetAnimation.bind(this); 

 154
    this.scrollHandler = this.scrollHandler.bind(this); 

 155
    this.scrollCallback = this.scrollCallback.bind(this); 

 156
    this.scrolled = true; 

 157
    this.config = extend(options, this.defaults); 

 158
    if (options.scrollContainer != null) { 

 159
      this.config.scrollContainer = document.querySelector(options.scrollContainer); 

 160
    } 

 161
  // Map of elements to animation names: 

 162
    this.animationNameCache = new WeakMap(); 

 163
    this.wowEvent = createEvent(this.config.boxClass); 

 164
  } 

 165

 

 166
  init() { 

 167
    this.element = window.document.documentElement; 

 168
    if (isIn(document.readyState, ['interactive', 'complete'])) { 

 169
      this.start(); 

 170
    } else { 

 171
      addEvent(document, 'DOMContentLoaded', this.start); 

 172
    } 

 173
    this.finished = []; 

 174
  } 

 175

 

 176
  start() { 

 177
    this.stopped = false; 

 178
    this.boxes = [].slice.call(this.element.querySelectorAll(`.${this.config.boxClass}`)); 

 179
    this.all = this.boxes.slice(0); 

 180
    if (this.boxes.length) { 

 181
      if (this.disabled()) { 

 182
        this.resetStyle(); 

 183
      } else { 

 184
        for (let i = 0; i < this.boxes.length; i++) { 

 185
          const box = this.boxes[i]; 

 186
          this.applyStyle(box, true); 

 187
        } 

 188
      } 

 189
    } 

 190
    if (!this.disabled()) { 

 191
      addEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler); 

 192
      addEvent(window, 'resize', this.scrollHandler); 

 193
      this.interval = setInterval(this.scrollCallback, 50); 

 194
    } 

 195
    if (this.config.live) { 

 196
      const mut = new MutationObserver(records => { 

 197
        for (let j = 0; j < records.length; j++) { 

 198
          const record = records[j]; 

 199
          for (let k = 0; k < record.addedNodes.length; k++) { 

 200
            const node = record.addedNodes[k]; 

 201
            this.doSync(node); 

 202
          } 

 203
        } 

 204
        return undefined; 

 205
      }); 

 206
      mut.observe(document.body, { 

 207
        childList: true, 

 208
        subtree: true, 

 209
      }); 

 210
    } 

 211
  } 

 212

 

 213
// unbind the scroll event 

 214
  stop() { 

 215
    this.stopped = true; 

 216
    removeEvent(this.config.scrollContainer || window, 'scroll', this.scrollHandler); 

 217
    removeEvent(window, 'resize', this.scrollHandler); 

 218
    if (this.interval != null) { 

 219
      clearInterval(this.interval); 

 220
    } 

 221
  } 

 222

 

 223
  sync() { 

 224
    if (MutationObserver.notSupported) { 

 225
      this.doSync(this.element); 

 226
    } 

 227
  } 

 228

 

 229
  doSync(element) { 

 230
    if (typeof element === 'undefined' || element === null) { ({ element } = this); } 

 231
    if (element.nodeType !== 1) { return; } 

 232
    element = element.parentNode || element; 

 233
    const iterable = element.querySelectorAll(`.${this.config.boxClass}`); 

 234
    for (let i = 0; i < iterable.length; i++) { 

 235
      const box = iterable[i]; 

 236
      if (!isIn(box, this.all)) { 

 237
        this.boxes.push(box); 

 238
        this.all.push(box); 

 239
        if (this.stopped || this.disabled()) { 

 240
          this.resetStyle(); 

 241
        } else { 

 242
          this.applyStyle(box, true); 

 243
        } 

 244
        this.scrolled = true; 

 245
      } 

 246
    } 

 247
  } 

 248

 

 249
// show box element 

 250
  show(box) { 

 251
    this.applyStyle(box); 

 252
    box.className = `${box.className} ${this.config.animateClass}`; 

 253
    if (this.config.callback != null) { this.config.callback(box); } 

 254
    emitEvent(box, this.wowEvent); 

 255

 

 256

 

 257
    if (this.config.resetAnimation) { 

 258
      addEvent(box, 'animationend', this.resetAnimation); 

 259
      addEvent(box, 'oanimationend', this.resetAnimation); 

 260
      addEvent(box, 'webkitAnimationEnd', this.resetAnimation); 

 261
      addEvent(box, 'MSAnimationEnd', this.resetAnimation); 

 262
    } 

 263

 

 264
    return box; 

 265
  } 

 266

 

 267
  applyStyle(box, hidden) { 

 268
    const duration = box.getAttribute('data-wow-duration'); 

 269
    const delay = box.getAttribute('data-wow-delay'); 

 270
    const iteration = box.getAttribute('data-wow-iteration'); 

 271

 

 272
    return this.animate(() => this.customStyle(box, hidden, duration, delay, iteration)); 

 273
  } 

 274

 

 275
  animate = (function animateFactory() { 

 276
    if ('requestAnimationFrame' in window) { 

 277
      return callback => window.requestAnimationFrame(callback); 

 278
    } 

 279
    return callback => callback(); 

 280
  }()); 

 281

 

 282
  resetStyle() { 

 283
    for (let i = 0; i < this.boxes.length; i++) { 

 284
      const box = this.boxes[i]; 

 285
      box.style.visibility = 'visible'; 

 286
    } 

 287
    return undefined; 

 288
  } 

 289

 

 290
  resetAnimation(event) { 

 291
    if (event.type.toLowerCase().indexOf('animationend') >= 0) { 

 292
      const target = event.target || event.srcElement; 

 293
      target.className = target.className.replace(this.config.animateClass, '').trim(); 

 294
    } 

 295
  } 

 296

 

 297
  customStyle(box, hidden, duration, delay, iteration) { 

 298
    if (hidden) { this.cacheAnimationName(box); } 

 299
    box.style.visibility = hidden ? 'hidden' : 'visible'; 

 300

 

 301
    if (duration) { this.vendorSet(box.style, { animationDuration: duration }); } 

 302
    if (delay) { this.vendorSet(box.style, { animationDelay: delay }); } 

 303
    if (iteration) { this.vendorSet(box.style, { animationIterationCount: iteration }); } 

 304
    this.vendorSet(box.style, { animationName: hidden ? 'none' : this.cachedAnimationName(box) }); 

 305

 

 306
    return box; 

 307
  } 

 308

 

 309
  vendors = ['moz', 'webkit']; 

 310
  vendorSet(elem, properties) { 

 311
    for (const name in properties) { 

 312
      if (properties.hasOwnProperty(name)) { 

 313
        const value = properties[name]; 

 314
        elem[`${name}`] = value; 

 315
        for (let i = 0; i < this.vendors.length; i++) { 

 316
          const vendor = this.vendors[i]; 

 317
          elem[`${vendor}${name.charAt(0).toUpperCase()}${name.substr(1)}`] = value; 

 318
        } 

 319
      } 

 320
    } 

 321
  } 

 322
  vendorCSS(elem, property) { 

 323
    const style = getComputedStyle(elem); 

 324
    let result = style.getPropertyCSSValue(property); 

 325
    for (let i = 0; i < this.vendors.length; i++) { 

 326
      const vendor = this.vendors[i]; 

 327
      result = result || style.getPropertyCSSValue(`-${vendor}-${property}`); 

 328
    } 

 329
    return result; 

 330
  } 

 331

 

 332
  animationName(box) { 

 333
    let aName; 

 334
    try { 

 335
      aName = this.vendorCSS(box, 'animation-name').cssText; 

 336
    } catch (error) { // Opera, fall back to plain property value 

 337
      aName = getComputedStyle(box).getPropertyValue('animation-name'); 

 338
    } 

 339

 

 340
    if (aName === 'none') { 

 341
      return '';  // SVG/Firefox, unable to get animation name? 

 342
    } 

 343

 

 344
    return aName; 

 345
  } 

 346

 

 347
  cacheAnimationName(box) { 

 348
  // https://bugzilla.mozilla.org/show_bug.cgi?id=921834 

 349
  // box.dataset is not supported for SVG elements in Firefox 

 350
    return this.animationNameCache.set(box, this.animationName(box)); 

 351
  } 

 352
  cachedAnimationName(box) { 

 353
    return this.animationNameCache.get(box); 

 354
  } 

 355

 

 356
  // fast window.scroll callback 

 357
  scrollHandler() { 

 358
    this.scrolled = true; 

 359
  } 

 360

 

 361
  scrollCallback() { 

 362
    if (this.scrolled) { 

 363
      this.scrolled = false; 

 364
      const results = []; 

 365
      for (let i = 0; i < this.boxes.length; i++) { 

 366
        const box = this.boxes[i]; 

 367
        if (box) { 

 368
          if (this.isVisible(box)) { 

 369
            this.show(box); 

 370
            continue; 

 371
          } 

 372
          results.push(box); 

 373
        } 

 374
      } 

 375
      this.boxes = results; 

 376
      if (!this.boxes.length && !this.config.live) { 

 377
        this.stop(); 

 378
      } 

 379
    } 

 380
  } 

 381

 

 382

 

 383
  // Calculate element offset top 

 384
  offsetTop(element) { 

 385
    // SVG elements don't have an offsetTop in Firefox. 

 386
    // This will use their nearest parent that has an offsetTop. 

 387
    // Also, using ('offsetTop' of element) causes an exception in Firefox. 

 388
    while (element.offsetTop === undefined) { 

 389
      element = element.parentNode; 

 390
    } 

 391
    let top = element.offsetTop; 

 392
    while (element.offsetParent) { 

 393
      element = element.offsetParent; 

 394
      top += element.offsetTop; 

 395
    } 

 396
    return top; 

 397
  } 

 398

 

 399
// check if box is visible 

 400
  isVisible(box) { 

 401
    const offset = box.getAttribute('data-wow-offset') || this.config.offset; 

 402
    const viewTop = ( 

 403
      this.config.scrollContainer && this.config.scrollContainer.scrollTop 

 404
    ) || window.pageYOffset; 

 405
    const viewBottom = 

 406
      viewTop + Math.min(this.element.clientHeight, getInnerHeight()) - offset; 

 407
    const top = this.offsetTop(box); 

 408
    const bottom = top + box.clientHeight; 

 409

 

 410
    return top <= viewBottom && bottom >= viewTop; 

 411
  } 

 412

 

 413
  disabled() { 

 414
    return !this.config.mobile && isMobile(navigator.userAgent); 

 415
  } 

 416
} 
