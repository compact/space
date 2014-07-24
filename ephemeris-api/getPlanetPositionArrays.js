/**
 * This algorithm is from http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf
 */

var _ = require('lodash');

// Keplerian elements and rates
var elements = {
  '1800ADTo2050AD': {}, // data from Table 1
  '3000BCTo3000AD': {}  // data from Tables 2a and 2b
};

// data from Table 1
elements['1800ADTo2050AD'].Mercury = {
  'a0': 0.38709927,
  'e0': 0.20563593,
  'I0': 7.00497902,
  'L0': 252.25032350,
  'pomega0': 77.45779628,
  'Omega0': 48.33076593,
  'aRate': 0.00000037,
  'eRate': 0.00001906,
  'IRate': -0.00594749,
  'LRate': 149472.67411175,
  'pomegaRate': 0.16047689,
  'OmegaRate': -0.12534081
};

elements['1800ADTo2050AD'].Venus = {
  'a0': 0.72333566,
  'e0': 0.00677672,
  'I0': 3.39467605,
  'L0': 181.97909950,
  'pomega0': 131.60246718,
  'Omega0': 76.67984255,
  'aRate': 0.00000390,
  'eRate': -0.00004107,
  'IRate': -0.00078890,
  'LRate': 58517.81538729,
  'pomegaRate': 0.00268329,
  'OmegaRate': -0.27769418
};

elements['1800ADTo2050AD'].EarthMoonBarycenter = {
  'a0': 1.00000261,
  'e0': 0.01671123,
  'I0': -0.00001531,
  'L0': 100.46457166,
  'pomega0': 102.93768193,
  'Omega0': 0.0,
  'aRate': 0.00000562,
  'eRate': -0.00004392,
  'IRate': -0.01294668,
  'LRate': 35999.37244981,
  'pomegaRate': 0.32327364,
  'OmegaRate': 0.0
};

elements['1800ADTo2050AD'].Mars = {
  'a0': 1.52371034,
  'e0': 0.09339410,
  'I0': 1.84969142,
  'L0': -4.55343205,
  'pomega0': -23.94362959,
  'Omega0': 49.55953891,
  'aRate': 0.00001847,
  'eRate': 0.00007882,
  'IRate': -0.00813131,
  'LRate': 19140.30268499,
  'pomegaRate': 0.44441088,
  'OmegaRate': -0.29257343
};

elements['1800ADTo2050AD'].Jupiter = {
  'a0': 5.20288700,
  'e0': 0.04838624,
  'I0': 1.30439695,
  'L0': 34.39644051,
  'pomega0': 14.72847983,
  'Omega0': 100.47390909,
  'aRate': -0.00011607,
  'eRate': -0.00013253,
  'IRate': -0.00183714,
  'LRate': 3034.74612775,
  'pomegaRate': 0.21252668,
  'OmegaRate': 0.20469106
};

elements['1800ADTo2050AD'].Saturn = {
  'a0': 9.53667594,
  'e0': 0.05386179,
  'I0': 2.48599187,
  'L0': 49.95424423,
  'pomega0': 92.59887831,
  'Omega0': 113.66242448,
  'aRate': -0.00125060,
  'eRate': -0.00050991,
  'IRate': 0.00193609,
  'LRate': 1222.49362201,
  'pomegaRate': -0.41897216,
  'OmegaRate': -0.28867794
};

elements['1800ADTo2050AD'].Uranus = {
  'a0': 19.18916464,
  'e0': 0.04725744,
  'I0': 0.77263783,
  'L0': 313.23810451,
  'pomega0': 170.95427630,
  'Omega0': 74.01692503,
  'aRate': -0.00196176,
  'eRate': -0.00004397,
  'IRate': -0.00242939,
  'LRate': 428.48202785,
  'pomegaRate': 0.40805281,
  'OmegaRate': 0.04240589
};

elements['1800ADTo2050AD'].Neptune = {
  'a0': 30.06992276,
  'e0': 0.00859048,
  'I0': 1.77004347,
  'L0': -55.12002969,
  'pomega0': 44.96476227,
  'Omega0': 131.78422574,
  'aRate': 0.00026291,
  'eRate': 0.00005105,
  'IRate': 0.00035372,
  'LRate': 218.45945325,
  'pomegaRate': -0.32241464,
  'OmegaRate': -0.00508664
};

elements['1800ADTo2050AD'].Pluto = {
  'a0': 39.48211675,
  'e0': 0.24882730,
  'I0': 17.14001206,
  'L0': 238.92903833,
  'pomega0': 224.06891629,
  'Omega0': 110.30393684,
  'aRate': -0.00031596,
  'eRate': 0.00005170,
  'IRate': 0.00004818,
  'LRate': 145.20780515,
  'pomegaRate': -0.04062942,
  'OmegaRate': -0.01183482
};

// data from Tables 2a and 2b
elements['3000BCTo3000AD'].Mercury = {
  'a0': 0.38709843,
  'e0': 0.20563661,
  'I0': 7.00559432,
  'L0': 252.25166724,
  'pomega0': 77.45771895,
  'Omega0': 48.33961819,
  'aRate': 0.00000000,
  'eRate': 0.00002123,
  'IRate': -0.00590158,
  'LRate': 149472.67486623,
  'pomegaRate': 0.15940013,
  'OmegaRate': -0.12214182
};

elements['3000BCTo3000AD'].Venus = {
  'a0': 0.72332102,
  'e0': 0.00676399,
  'I0': 3.39777545,
  'L0': 181.97970850,
  'pomega0': 131.76755713,
  'Omega0': 76.67261496,
  'aRate': -0.00000026,
  'eRate': -0.00005107,
  'IRate': 0.00043494,
  'LRate': 58517.81560260,
  'pomegaRate': 0.05679648,
  'OmegaRate': -0.27274174
};

elements['3000BCTo3000AD'].EarthMoonBarycenter = {
  'a0': 1.00000018,
  'e0': 0.01673163,
  'I0': -0.00054346,
  'L0': 100.46691572,
  'pomega0': 102.93005885,
  'Omega0': -5.11260389,
  'aRate': -0.00000003,
  'eRate': -0.00003661,
  'IRate': -0.01337178,
  'LRate': 35999.37306329,
  'pomegaRate': 0.31795260,
  'OmegaRate': -0.24123856
};

elements['3000BCTo3000AD'].Mars = {
  'a0': 1.52371243,
  'e0': 0.09336511,
  'I0': 1.85181869,
  'L0': -4.56813164,
  'pomega0': -23.91744784,
  'Omega0': 49.71320984,
  'aRate': 0.00000097,
  'eRate': 0.00009149,
  'IRate': -0.00724757,
  'LRate': 19140.29934243,
  'pomegaRate': 0.45223625,
  'OmegaRate': -0.26852431
};

elements['3000BCTo3000AD'].Jupiter = {
  'a0': 5.20248019,
  'e0': 0.04853590,
  'I0': 1.29861416,
  'L0': 34.33479152,
  'pomega0': 14.27495244,
  'Omega0': 100.29282654,
  'aRate': -0.00002864,
  'eRate': 0.00018026,
  'IRate': -0.00322699,
  'LRate': 3034.90371757,
  'pomegaRate': 0.18199196,
  'OmegaRate': 0.13024619,
  'b': -0.00012452,
  'c': 0.06064060,
  's': -0.35635438,
  'f': 38.35125000
};

elements['3000BCTo3000AD'].Saturn = {
  'a0': 9.54149883,
  'e0': 0.05550825,
  'I0': 2.49424102,
  'L0': 50.07571329,
  'pomega0': 92.86136063,
  'Omega0': 113.63998702,
  'aRate': -0.00003065,
  'eRate': -0.00032044,
  'IRate': 0.00451969,
  'LRate': 1222.11494724,
  'pomegaRate': 0.54179478,
  'OmegaRate': -0.25015002,
  'b': 0.00025899,
  'c': -0.13434469,
  's': 0.87320147,
  'f': 38.35125000
};

elements['3000BCTo3000AD'].Uranus = {
  'a0': 19.18797948,
  'e0': 0.04685740,
  'I0': 0.77298127,
  'L0': 314.20276625,
  'pomega0': 172.43404441,
  'Omega0': 73.96250215,
  'aRate': -0.00020455,
  'eRate': -0.00001550,
  'IRate': -0.00180155,
  'LRate': 428.49512595,
  'pomegaRate': 0.09266985,
  'OmegaRate': 0.05739699,
  'b': 0.00058331,
  'c': -0.97731848,
  's': 0.17689245,
  'f': 7.67025000
};

elements['3000BCTo3000AD'].Neptune = {
  'a0': 30.06952752,
  'e0': 0.00895439,
  'I0': 1.77005520,
  'L0': 304.22289287,
  'pomega0': 46.68158724,
  'Omega0': 131.78635853,
  'aRate': 0.00006447,
  'eRate': 0.00000818,
  'IRate': 0.00022400,
  'LRate': 218.46515314,
  'pomegaRate': 0.01009938,
  'OmegaRate': -0.00606302,
  'b': -0.00041348,
  'c': 0.68346318,
  's': -0.10162547,
  'f': 7.67025000
};

elements['3000BCTo3000AD'].Pluto = {
  'a0': 39.48686035,
  'e0': 0.24885238,
  'I0': 17.14104260,
  'L0': 238.96535011,
  'pomega0': 224.09702598,
  'Omega0': 110.30167986,
  'aRate': 0.00449751,
  'eRate': 0.00006016,
  'IRate': 0.00000501,
  'LRate': 145.18042903,
  'pomegaRate': -0.00968827,
  'OmegaRate': -0.00809981,
  'b': -0.01262724,
};

// convert radians to degrees
var radToDeg = function(rad) {
  return rad * 180 / Math.PI;
};

// convert degrees to radians
var degToRad = function(deg) {
  return deg * Math.PI / 180;
};

// sine of a degree
var sinDeg = function (deg) {
  return Math.sin(degToRad(deg));
};

// cosine of a degree
var cosDeg = function (deg) {
  return Math.cos(degToRad(deg));
};

// compute the position on the J2000.0 ecliptic plane with the given Keplerian
// elements at time T; the 5 steps of this algorithm are from the PDF linked
// above
var getPlanetPositionArrays = function (T, elements) {
  // step 1: compute the six elements
  var a = elements.a0 + elements.aRate * T;                // in au
  var e = elements.e0 + elements.eRate * T;                // in radians
  var I = elements.I0 + elements.IRate * T;                // in degrees
  var L = elements.L0 + elements.LRate * T;                // in degrees
  var pomega = elements.pomega0 + elements.pomegaRate * T; // in degrees
  var Omega = elements.Omega0 + elements.OmegaRate * T;    // in degrees

  // step 2
  var omega = pomega - Omega;                              // in degrees
  var b = elements.b || 0;
  var c = elements.c || 0;
  var s = elements.s || 0;
  var f = elements.f || 0;
  var M = L - pomega + b * T * T + c * cosDeg(f * T) + s * sinDeg(f * T);
                                                           // in degrees

  // step 3: modulus M so that -180 ≤ M ≤ 180
  M = ((M % 360) + 360) % 360; // 0 ≤ M < 360
  if (M > 180) {
    M -= 360;
  }

  // step 3 (continued): solve Kepler's equation approximately
  var eDeg = radToDeg(e);                                  // in degrees
  var E = M + eDeg * sinDeg(M);                            // in degrees
  var deltaM, deltaE = 0, n = 0;
  do {
    deltaM = M - (E - eDeg * sinDeg(E));
    deltaE = deltaM / (1 - e * cosDeg(E));
    E += deltaE;
    n++;
  // 0.000001 is the recommended tolerance; 100 is an arbitrary limit to make
  // sure this loop always terminates
  } while (Math.abs(deltaE) > 0.000001 && n < 100)

  // step 4: compute x prime and y prime (z prime is 0 and unused)
  var xP = a * (cosDeg(E) - e);                            // in au
  var yP = a * Math.sqrt(1 - e * e) * sinDeg(E);           // in au

  // step 5: compute the coordinates on the J2000 ecliptic plane
  var co = cosDeg(omega);
  var so = sinDeg(omega);
  var cO = cosDeg(Omega);
  var sO = sinDeg(Omega);
  var cI = cosDeg(I);
  var sI = sinDeg(I);
  var xEcl = (co * cO - so * sO * cI) * xP + (-so * cO - co * sO * cI) * yP;
  var yEcl = (co * sO + so * cO * cI) * xP + (-so * sO + co * cO * cI) * yP;
  var zEcl =  so                * sI  * xP +   co                * sI  * yP;

  // skip step 6 because we don't need equatorial coordinates

  // return the position as an array
  return [xEcl, yEcl, zEcl];
};

// compute each planet's position on the J2000.0 ecliptic plane on the given
// Julian Day Number
module.exports = function (jdn) {
  // compute the time in centuries past J2000.0
  var T = (jdn - 2451545) / 36525;

  // choose the appropriate set of elements
  var elementsAtT = -2 <= T && T <= 0.5 ? elements['1800ADTo2050AD'] :
    elements['3000BCTo3000AD'];

  return _.map(elementsAtT, _.partial(getPlanetPositionArrays, T));
};
