var debug = require('debug')('protoo:sessionHandler');

var Session = require('../Session');

module.exports = sessionHandler;

function sessionHandler(app, options)
{
	options = options || {};

	// Create a Router to be returned by the function.
	var router = app.Router();
	var path = options.path || '/:username/:uuid';
	var onsession = options.onsession;
	var session;

	/**
	 * Initial "session" request handler.
	 */
	router.route(path)
		.session(function(req)
		{
			var username = req.params.username;
			var uuid = req.params.uuid;
			var peer;

			// Ensure that both username and uuid are given.
			if (!username || !uuid)
			{
				debug('both username and uuid must be given, replying 400');

				req.reply(400, 'no username and/or uuid given');
				return;
			}

			debug('target peer: [username:%s, uuid:%s]', username, uuid);

			peer = app.peer(username, uuid);

			if (peer)
			{
				debug('remote peer found: %s', peer);

				// Create the session.
				session = Session.add(
					{
						req: req,
						peerA: req.peer,
						peerB: peer,
						basePath: req.basePath + '/sessions'
					});

				// Emit "onsession" event.
				if (onsession)
				{
					onsession(session);
				}
			}
			else
			{
				req.reply(404, 'peer not found');
				return;
			}
		});

	/**
	 * in-session requests handler.
	 */
	router.route('/sessions/:id')
		.all(function(req)
		{
			var session = Session.get(req.params.id);

			if (session)
			{
				debug('in-session request for session "%s": %s', req.params.id, req);
				session.handleRequest(req);
			}
			else
			{
				debug('no session found with id "%s"', req.params.id);
				req.reply(404, 'session not found');
			}
		});

	return router;
}