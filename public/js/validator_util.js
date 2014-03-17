var tagList = [
	{
		name: 'font',
		selfTag: false,
		attributes: {
			color: 'color',
			size: 'number'
		}
	},
	{
		name: 'br',
		selfTag: true,
		attributes: {}
	},
	{
		name: 'b',
		selfTag: false,
		attributes: {}
	},
	{
		name: 'i',
		selfTag: false,
		attributes: {}
	},
	{
		name: 'u',
		selfTag: false,
		attributes: {}
	}
];

// TODO - migration /utils/validator_util.js
var validateText = function (text) {
	var errMsgs = [];
	if (!text) return errMsgs;
	try {
		text = text.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">");
	} catch (e) {
		return errMsgs;
	}
	var stack = [];
	var tempText = text;
	var openTagIdx;
	var closeTagIdx;
	while (true) {
		openTagIdx = tempText.indexOf('<');
		if (-1 == openTagIdx) {
			break;
		}
		closeTagIdx = tempText.indexOf('>');
		if (-1 == closeTagIdx) {
			errMsgs.push('Tag is not completed.');
			break;
		} else if (openTagIdx > closeTagIdx) {
			// case :
			closeTagIdx = tempText.substring(closeTagIdx + 1).indexOf('>') + closeTagIdx + 1;
		}

		var tag = tempText.substring(openTagIdx + 1, closeTagIdx).toLowerCase().replace(/(\s*)=(\s*)/g, '=').trim();
		tempText = tempText.substring(closeTagIdx + 1).trim();

		// separate name and attributes
		var tagDatas = tag.split(' ');
		var tagName = tagDatas[0].trim();

		tagDatas.shift();

		// close tag
		var slashIdx = tagName.indexOf('/');
		var selfTag = false;
		if (0 === slashIdx) {
			tagName = tagName.substring(1);
			// check tag sequence
			var elem = stack.pop();
			if (elem !== tagName) {
				errMsgs.push('Tag order is not correct. -> &lt;/' + tagName + '&gt;');
			}
			continue;
		} else if (0 < slashIdx) {
			tagName = tagName.substring(0, slashIdx);
			selfTag = true;
		}

		// check tag
		var tagInfo = getTagInfo(tagName);
		if (!tagInfo) {
			errMsgs.push('&lt;' + tagName + '&gt; is not support. ');
			continue;
		}

		// self tag check
		if (true === tagInfo.selfTag) {
			continue;
		} else if (selfTag) {
			errMsgs.push('&lt;' + tagName + '&gt; is not self tag');
			continue;
		}

		stack.push(tagName);

		checkAttributes(tagDatas, tagInfo, errMsgs);
	}

	for (var i = 0 ; i < stack.length ; i++) {
		errMsgs.push('&lt;' + stack[i] + '&gt; is required &lt;/' + stack[i] + '&gt;');
	}

	return errMsgs;
};

var getTagInfo = function (tagName) {
	for (var i = 0 ; i < tagList.length ; i++) {
		if (tagName == tagList[i].name) {
			return tagList[i];
		}
	}
	return null;
};

var checkAttributes = function (attributes, tagInfo, errMsgs) {
	if (!attributes || !tagInfo) return;

	for (var i = 0 ; i < attributes.length ; i++) {
		if ('' === attributes[i]) continue;
		var attr = attributes[i].split('=');
		var key = attr[0];
		var val = attr[1];

		if (!checkQuotation(val, errMsgs)) continue;

		if ("string" === typeof val) {
			val = val.trim().replace(/"/g, '').replace(/'/g, '');
		}

		if (!tagInfo.attributes[key]) {
			errMsgs.push(key + ' is not &lt;' + tagInfo.name + '&gt; attribute');
			continue;
		}

		// validate
		if ('color' === tagInfo.attributes[key]) {
			// attribute value type
			val += '';
			var res = val.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
			if (!res) {
				errMsgs.push(val + ' is not color code');
			}
		} else if ('number' === tagInfo.attributes[key]) {
			// check number type
			if (isNaN(Number(val))) {
				errMsgs.push(val + ' is not number type');
			}
		} else if ('string' === tagInfo.attributes[key]) {
			// TODO : check number type
		} else if ('date' === tagInfo.attributes[key]) {
			// TODO : check number type
		}
	}
};

var checkQuotation = function (text, errMsgs) {
	if (!text) return true;

	text = text.trim();
	var symbols = ['\'', '\"'];
	var noQuotation = true;
	for (var i = 0 ; i < symbols.length ; i++) {
		var idx1 = text.indexOf(symbols[i]);
		var idx2 = -1;
		if (-1 != idx1) {
			idx2 = text.substring(idx1+1).indexOf(symbols[i]);
			if (-1 === idx2 || idx1 + idx2 + 2 !== text.length) {
				errMsgs.push(text + ' is not valid attribute');
				return false;
			}

			noQuotation = false;
		}
	}
	if (noQuotation) {
		errMsgs.push('Attribute is required \" -> text');
		return false;
	}
	return true;
};