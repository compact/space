# Explore space in your browser

This project uses [three.js](http://threejs.org/) to render astronomical bodies.

## Workflow

### Develop

```
git clone git@github.com:joshacheson/kimchi.git
cd kimchi
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
