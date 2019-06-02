docset
======

Wraps a Dash docset for use in dash-like applications

installation
------------

~~look, i'll put it up on npm later, ok? don't judge me.~~

`yarn add docset`

`npm install docset`

usage
-----

```javascript
const docset = require('docset')
const handle = docset('/home/dmr/.docsets/Docker.docset')
// find the `docker-compose run` entry
handle.lookup('do com run')
```
