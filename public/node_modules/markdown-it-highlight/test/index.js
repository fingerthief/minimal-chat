import assert from 'assert'
import markdownIt from 'markdown-it'
import markdownItHighlight from '../dist/index'

const mdi = markdownIt()
mdi.use(markdownItHighlight)

console.log(mdi.render(`
    print 'hello world'
`))
assert(mdi.render(`
    print 'hello world'
`).trim() === `<pre><code>print 'hello world'
</code></pre>`)

console.log(mdi.render(`\`\`\`
print 'hello world'
\`\`\``))
assert(mdi.render(`\`\`\`
print 'hello world'
\`\`\``).trim() === `<pre><code>print 'hello world'
</code></pre>`)

console.log(mdi.render(`\`\`\`python
print 'hello world'
\`\`\``))
assert(mdi.render(`\`\`\`python
print 'hello world'
\`\`\``) === `<pre><code class="hljs"><span class="hljs-keyword">print</span> <span class="hljs-string">'hello world'</span></code></pre>`)
