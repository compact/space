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

## Ephemeris API

```
GET http://localhost:3001/ephemeris?start=&step=&limit=
```

This API outputs in JSON the planets' approximate coordinates on the J2000.0 ecliptic plane on the given days. The algorithm is from [NASA JPL](http://ssd.jpl.nasa.gov/?planet_pos) and the array indexes correspond to the order of the planets in the tables found on that page.

* `start`: The first Julian Day Number of the result set. Defaults to `2451545`.
* `step`: The increment in days between each successive pair of results. Defaults to `1`.
* `limit`: The number of days in the result set. Defaults to `1`.

For example, the output of `/ephemeris` with no parameters is

```
{
  "planetPositionArrays": {
    "2451545": [
      [-0.13008862039899763,-0.44729233660209183,-0.024598819714780944],
      [-0.7183163556380716,-0.032706661636121126,0.04101562434829495],
      [-0.17717124910462478,0.9672144849669475,-2.584492940088755e-7],
      [1.3906677476780214,-0.013391064158330246,-0.03446125922330577],
      [3.9983209397841453,2.9457109110685096,-0.10171781461585172],
      [6.414784487255078,6.545667464903092,-0.3691467728543547],
      [14.425465882509505,-13.737645725717435,-0.23803312037558913],
      [16.804762811918884,-24.992709860239785,0.12740321008663258],
      [-9.883030192253438,-27.963595420162292,5.851153745541148]
    ]
  }
}
```
