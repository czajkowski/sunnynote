# Sunnynote
JS simple text editor

[![Build Status](https://travis-ci.org/czajkowski/sunnynote.svg)](https://travis-ci.org/czajkowski/sunnynote)

### Sunnynote
Sunnynote is a simplified JavaScript text editor based on Summernote (http://summernote.org/).

#### Inspired by
* Summernote (http://summernote.org/)

### Installation and dependencies

Sunnynote uses opensource libraries: [jQuery](http://jquery.com/).

#### 1. include JS/CSS

Include the following code in the `<head>` tag of your HTML:

```html
<!-- include libraries(jQuery, bootstrap, fontawesome) -->
<script type="text/javascript" src="//code.jquery.com/jquery-1.9.1.min.js"></script> 

<!-- include sunnynote js-->
<script src="sunnynote.min.js"></script>
```

#### 2. target elements

Then place a `div` tag somewhere in the `body` tag. This element will be replaced with the summernote editor.

```html
<div id="sunnynote">Hello!</div>
```

#### 3. sunnynote

Finally, run this script after the DOM is ready:

```javascript
$(document).ready(function() {
  $('#sunnynote').sunnynote();
});
```

### Supported platforms

Any modern browser: Safari, Chrome, Firefox, Opera, Internet Explorer 9+.


#### Build sunnynote
```bash
# grunt-cli is need by grunt; you might have this installed already
npm install -g grunt-cli
npm install

# build full version of sunnynote: dist/sunnynote.js
grunt build

# generate minified copy: dist/sunnynote.min.js
grunt dist
```
At this point, you should now have a `build/` directory populated with everything you need to use sunnynote.

#### test sunnynote
run tests with PhantomJS
```bash
grunt test
```

#### start local server for developing sunnynote.
run local server with connect and watch.
```bash
# this will open a browser on http://localhost:3000.
grunt server
```

#### Coding convention
* JSHint: http://www.jshint.com/about/
* JSHint rule: https://github.com/czajkowski/sunnynote/blob/master/.jshintrc

### License
Sunnynote may be freely distributed under the MIT license.
