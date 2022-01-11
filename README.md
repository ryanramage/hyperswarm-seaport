# hyperswarm-seaport

p2p service registry and port assignment

*NOTE* - this is readme driven development. Features will be implemented when this note is removed.

Seaport makes it so you won't need to spend so much effort keeping configuration files current as your
architecture grows to span many processes on many machines. Just register your
services with seaport and then query seaport to see where your services are running.

To connect things together, you will need something taking care of the following roles:

 - server. Publishes a service with a named role@version (like a package.json specification)
 - client. Asks for a named service with a role@semver requirements (like a dependency)
 - registry. Manages connecting clients with servers.

These roles can be run in 3 processes spread across the internet, or combined together.

# example

## registry

First spin up a hyperswarm-seaport registry server

```
$ hyperswarm-seaport listen
 - Registry listening connect with pubkey whattzzuu5drxwdwi6xbijjf7yt56l5adzht7j7kjvfped7amova
```

## server

``` js
const seaport = require('hyperswarm-seaport')
const pubkey = process.argv[2]
const ports = seaport.connect(pubkey)
const http = require('http')
const server = http.createServer((req, res) => res.end('beep boop\r\n'))
server.listen(ports.register('web@1.2.3'))
```

this will register a spork bound local port, the pubkey will be submitted to the seaport registry above.

## client

next just `get()` that `'web'` service

``` js
const seaport = require('hyperswarm-seaport');
const pubkey = process.argv[2]
const ports = seaport.connect(pubkey);
const request = require('request')
ports.get('web@1.2.x', (ps) => request(`http://${ps[0].host}:${ps[0].port}`).pipe(process.stdout))
```

for the client, the host (ps[0].host) will be localhost, with a spork activated local proxy that will connect to the service registered above

## Result

the output of running all of this will be:

```
$ node server.js whattzzuu5drxwdwi6xbijjf7yt56l5adzht7j7kjvfped7amova &
[1] 6012
$ node client.js whattzzuu5drxwdwi6xbijjf7yt56l5adzht7j7kjvfped7amova
beep boop
```

and if you spin up `client.js` before `server.js` then it still works because
`get()` queues the response!
