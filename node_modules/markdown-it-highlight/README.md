# markdown-it-highlight

highlight.js plugin for [markdown-it](https://github.com/markdown-it/markdown-it).


## install

```
yarn add markdown-it-highlight
```


## usage

### for node.js

```js
import markdownIt from 'markdown-it'
import markdownItHighlight from 'markdown-it-highlight'

const mdi = markdownIt()
mdi.use(markdownItHighlight)

mdi.render(`
    print 'hello world'
`) // <pre><code>print 'hello world'</code></pre>
```

### for browser

You also need to import the css:

```js
import 'markdown-it-highlight/dist/index.css'
```

Or you can add the css to the web page directly.


## Development

### Build

```
yarn build:watch
```

### Test

```
yarn test
```

### Distribution

```
yarn release && npm publish
```


## Todo
