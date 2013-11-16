/**
 * DOM manipulation module
 * @namespace
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// declarations
var dom = {};


/**
 * Removes all child elements from the given HTML element
 * @param {Node} tag element to be cleared
 * @return {Node} empty HTML tag
 * @example
 *		TODO: add
 */
dom.clear = function ( tag ) {
	// valid non-empty tag
	if ( tag instanceof Node ) {
		while ( tag.firstChild ) {
			// clear till has some
			tag.removeChild(tag.firstChild);
		}
	}
	return tag;
};


/**
 * Removes the given HTML element from the DOM
 * @param {Node} tag element to be removed
 * @example
 *		TODO: add
 */
dom.remove = function ( tag ) {
	// valid non-empty tag
	if ( tag instanceof Node && tag.parentNode instanceof Node ) {
		// clear till has some
		tag.parentNode.removeChild(tag);
	}
};


/**
 * Creates a new HTML element
 * @param {String} tagName mandatory tag name
 * @param {Object} [attrList] element attributes (empty object if none)
 * @param {...String|...Number|...Node} [content] element content (should not be empty)
 * @return {Node} HTML tag
 * @example
 *		TODO: add
 */
dom.tag = function ( tagName, attrList, content ) {
	// prepare
	var index,
	// attribute names as array
		attrKeys = typeof attrList === 'object' ? Object.keys(attrList) : [],
		newNode  = null;  // Element placeholder
	// minimal param is given
	if ( tagName ) {
		// empty element
		newNode = document.createElement(tagName);

		// attributes
		for ( index = 0; index < attrKeys.length; index++ ) {
			// extend a new node with the given attributes
			newNode[attrKeys[index]] = attrList[attrKeys[index]];
		}

		// content (arguments except the first two)
		for ( index = 2; index < arguments.length; index++ ) {
			// some data is given
			if ( arguments[index] ) {
				// regular HTML tag or plain data
				newNode.appendChild(arguments[index] instanceof Node ? arguments[index] : document.createTextNode(arguments[index]));
			}
		}

	}
	// element or null on failure
	return newNode;
};


/**
 * Creates a new DocumentFragment filled with the given non-empty elements if any.
 * @param {...String|...Number|...Node} [content] element list to add
 * @return {DocumentFragment} new placeholder
 * @example
 *		// gives an empty fragment element
 *		fragment();
 *		// gives a fragment element with 3 div element inside
 *		fragment(div1, div2, div3);
 *		// mixed case
 *		fragment('some text', 123, div3);
 */
dom.fragment = function ( content ) {
	// prepare placeholder
	var index, fragment = document.createDocumentFragment();
	// walk through all the given elements
	for ( index = 0; index < arguments.length; index++ ) {
		// some data is given
		if ( arguments[index] ) {
			// regular HTML tag or plain data
			fragment.appendChild(arguments[index] instanceof Node ? arguments[index] : document.createTextNode(arguments[index]));
		}
	}
	return fragment;
};


/**
 * Adds the given non-empty data (HTML element/text or list) to the destination element
 * @param {Node} tagDst element to receive children
 * @param {...String|...Number|...Node} [content] element list to add
 * @return {Node} the destination element - owner of all added data
 * @example
 *		// simple text value
 *		add(some_div, 'Hello world');
 *		// single DOM Element
 *		add(some_div, some_other_div);
 *		// DOM Element list
 *		add(some_div, div1, div2, div3);
 *		// mixed case
 *		add(some_div, div1, 'hello', 'world');
 */
dom.add = function ( tagDst, content ) {
	// prepare
	var index;
	// valid HTML tag as the destination
	if ( tagDst instanceof Node ) {
		// append all except the first one
		for ( index = 1; index < arguments.length; index++ ) {
			// some data is given
			if ( arguments[index] ) {
				// regular HTML tag or plain data
				tagDst.appendChild(arguments[index] instanceof Node ? arguments[index] : document.createTextNode(arguments[index]));
			}
		}
	}
	return tagDst;
};


// public export
module.exports = dom;