'use strict';

var request = require('request'),
	async = require('async');

async.waterfall([
	function getMarkDownHTML (cb) {
		if (!process.env.HACKMD_PAD_URL) {
			return cb(new Error('Unable to start: HACKMD_PAD_URL empty'));
		}
		if (!process.env.CONFLUENCE_URL) {
			return cb(new Error('Unable to authenticate: CONFLUENCE_URL empty'));
		}
		if (!process.env.CONFLUENCE_CONTENT_ID) {
			return cb(new Error('Unable to start: CONFLUENCE_CONTENT_ID empty'));
		}

		request.get({
			uri: process.env.HACKMD_PAD_URL,
			followRedirect: true
		}, function (err, response, body) {
			if (err) {
				return cb(err);
			}

			cb(null, body);
		});
	},
	function parseHTML (html, cb) {
		var cheerio = require('cheerio'),
			$ = cheerio.load(html);

		cb(null, $('#doc').text().trim());
	},
	function filterMarkdown (md, cb) {
		// filter ::: boxes
		md = md.replace(/(:::(?:success|info|warning|danger)[\n]?[\s\S]+?(?=:::):::[\n]?)/gm, '');

		// filter source code
		md = md.replace(/```\s*\w*([^`]+)```/g, function(_, code) {
			return '<code><pre>' + code.trim() + '</pre></code>';
		});

		cb(null, md);
	},
	function generateRealHTML (md, cb) {
		request.post({
			uri: 'https://api.github.com/markdown/raw',
			followRedirect: true,
			body: md,
			headers: {
				'Content-Type': 'text/plain',
				'User-Agent': 'net.sebbo.fhws-hackmd-to-confluence'
			}
		}, function (err, response, body) {
			if (err) {
				return cb(err);
			}

			// fix headlines
			body = body.replace(
				/<h(\d)>\s*<a id="user-content-([^"]+)[^\/]+><span>[^<]+<\/span><\/a>([^\/]+)<\/h\d>/g,
				function(_, h, id, text) {
					return '<h' + h + '><a id="' + id + '" href="#' + id + '">' + text + '</a>';
				}
			);

			// convert to XHTML
			body = require('xhtml-purifier').purify(body);

			cb(null, body);
		});
	},
	function getCurrentContentVersion (html, cb) {
		request.get({
			uri: process.env.CONFLUENCE_URL + '/rest/api/content/' + process.env.CONFLUENCE_CONTENT_ID,
			followRedirect: true,
			json: true
		}, function (err, response, body) {
			if (err || !body || !body.version || !body.version.number) {
				return cb(err || new Error('No version number found!'));
			}

			cb(null, html, body.version.number, body.title);
		});
	},
	function getNewContent (html, version, title, cb) {
		request.put({
			uri: process.env.CONFLUENCE_URL + '/rest/api/content/' + process.env.CONFLUENCE_CONTENT_ID,
			followRedirect: true,
			json: true,
			body: {
				type: 'page',
				title: title,
				body: {
					storage: {
						value: html,
						representation: 'storage'
					}
				},
				version: {
					number: version + 1
				}
			}
		}, function (err, html, body) {
			if (err) {
				return cb(err);
			}

			if(!body.id || body.statusCode) {
				console.log('Couldn\'t update content:', body.message || body);
			}
		});
	}
], function (err) {
	if (err && err !== true) {
		console.error(err);
	}
});
