# Space exploration web app

http://compact.github.io/space/

This app allows you to navigate through space in your browser. It uses [three.js](http://threejs.org/) to render astronomical bodies.

## Workflow

### Develop

```
npm install
bower install
node app.js
```

Go to `http://localhost:3001`.

### Build

```
npm install -g grunt
grunt build
```

The built files are located in `/dist/`.

### Generate docs

```
npm install -g jsdoc
jsdoc -p -d app/docs app/scripts/ app/data/
```
