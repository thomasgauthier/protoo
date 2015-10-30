var debug = require('debug')('protoo:messenger');
// var debugerror = require('debug')('protoo:ERROR:messenger');

module.exports = messenger;

function messenger(app, options)
{
	options = options || {};

	// Create a Router to be returned by the function
	var router = app.Router();
	var path = options.path || '/:username/:uuid?';

	router.route(path)
		.message(function(req)
		{
			var username = req.params.username;
			var uuid = req.params.uuid;
			var found;

			debug('target peer: [username:%s, uuid:%s]', username, uuid);

			found = app.peers(username, uuid, function(peerB)
			{
				debug('sending message request to %s', peerB);

				peerB.send(req);
			});

			if (found === 1)
			{
				req.on('incomingResponse', function(res)
				{
					req.reply(res);
				});
			}
			else if (found > 1)
			{
				req.reply(200, 'message sent to ' + found + ' peers');
			}
			else
			{
				req.reply(404, 'peer not found');
			}
		});

	return router;
}