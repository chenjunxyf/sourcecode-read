(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.shave = factory());
}(this, (function () { 'use strict';

function shave(target, maxHeight, opts) {
  if (!maxHeight) throw Error('maxHeight is required');
  var els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) els = [els];

  var defaults = {
    character: '…',         // 默认占位符
    classname: 'js-shave',  // 默认隐藏文本的定位选择器
    spaces: true            // 是否是一种由空格分隔的语言，如：英语
  };
  var character = opts && opts.character || defaults.character;
  var classname = opts && opts.classname || defaults.classname;
  var spaces = opts && opts.spaces === false ? false : defaults.spaces;
  var charHtml = '<span class="js-shave-char">' + character + '</span>';

  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var span = el.querySelector('.' + classname);

    var textProp = el.textContent === undefined ? 'innerText' : 'textContent';

    // If element text has already been shaved
    if (span) {
      // Remove the ellipsis to recapture the original text
      el.removeChild(el.querySelector('.js-shave-char'));
      el[textProp] = el[textProp]; // nuke span, recombine text
    }

    var fullText = el[textProp];
    var words = spaces ? fullText.split(' ') : fullText;

    // If 0 or 1 words, we're done
    if (words.length < 2) continue;

    // Temporarily remove any CSS height for text height calculation
    var heightStyle = el.style.height;
    el.style.height = 'auto';
    var maxHeightStyle = el.style.maxHeight;
    el.style.maxHeight = 'none';

    // If already short enough, we're done
    // 通过比较元素的offsetHeight属性
    // offsetHeight = border+padding+height+scroll
    if (el.offsetHeight < maxHeight) {
      el.style.height = heightStyle;
      el.style.maxHeight = maxHeightStyle;
      continue;
    }

    // 二分查找合适的分隔位置，提升效率
    var max = words.length - 1;
    var min = 0;
    var pivot = void 0;
    while (min < max) {
      pivot = min + max + 1 >> 1;
      el[textProp] = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot);
      el.insertAdjacentHTML('beforeend', charHtml);
      if (el.offsetHeight > maxHeight) max = spaces ? pivot - 1 : pivot - 2;else min = pivot;
    }

    el[textProp] = spaces ? words.slice(0, max).join(' ') : words.slice(0, max);
    el.insertAdjacentHTML('beforeend', charHtml);
    var diff = spaces ? words.slice(max + 1).join(' ') : words.slice(max);

    // 被截断的隐藏字符
    el.insertAdjacentHTML('beforeend', '<span class="' + classname + '" style="display:none;">' + diff + '</span>');

    el.style.height = heightStyle;
    el.style.maxHeight = maxHeightStyle;
  }
}

if (typeof window !== 'undefined') {
  var plugin = window.$ || window.jQuery || window.Zepto;
  if (plugin) {
    plugin.fn.shave = function shavePlugin(maxHeight, opts) {
      shave(this, maxHeight, opts);
      return this;
    };
  }
}

return shave;

})));
