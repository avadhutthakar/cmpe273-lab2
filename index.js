var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);


function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};
function post(request, response) {
	/* Taking the request object into variable. Then we can copy all the required
	 * values seperately.
	 */
	 var requestObject = request.body;
	 var loggedInUserName = requestObject['name'];
	 var loggedInUserEmail = requestObject['email'];

	// var newSessionId = login.login('xxx', 'xxx@gmail.com');
	// Form the sessionId using above given code
	var newSessionId = login.login(loggedInUserName, loggedInUserEmail);
	//Set session and content type.
	response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
	response.setHeader('Content-Type', 'text/html');
 	response.end(login.hello(newSessionId));

};



function del(request, response) {
    console.log("DELETE:: Logout from the server");
	var cookies = request.cookies;
	console.log(cookies);
 	// No need to set session id in the response cookies since you just logged out!
 	// Validate passed out session is correct or not.
	if ('session_id' in cookies) {
		var sessionId = cookies['session_id'];
		if ( login.isLoggedIn(sessionId) ) {
			login.logout(sessionId);
			response.end('Logged out from the server\n');
		}else{
			response.end("Invalid session_id! Please login again\n");
		}
	}else{
  		response.end('No session id found in the request.\n');
	}
};

function put(request, response) {

	console.log("PUT:: Re-generate new seesion_id for the same user");
	// Read the cookies.
	var cookies = request.cookies;
	// Get the session id
	var sessionId = cookies['session_id'];
	//Cheking for correct session id
	if ('session_id' in cookies){
		if ( login.isLoggedIn(sessionId) ) {
				// Form new session id
				var newSessionId = login.login(login.sessionMap[sessionId].name, login.sessionMap[sessionId].email);
       			// Set new session in the form of cookie
       			response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
				response.end("Re-freshed session id\n");
        	}else{
	       		response.end("Invalid session_id! Please login again\n");
		}
	}else{
		// Print = no session id found in the request
		response.end("No Session ID found in the request\n");
	}
};

app.listen(8000);
console.log("Node.JS server running at 8000...");
