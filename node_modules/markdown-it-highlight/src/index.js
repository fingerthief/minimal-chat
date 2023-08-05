import 'highlight.js/styles/atom-one-light.css'

import hljs from 'highlight.js'

const highlightPlugin = (md) => {
  const temp = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content.trim()
    if (token.info.length > 0) {
      return `<pre><code class="hljs">${hljs.highlightAuto(code, [token.info]).value}</code></pre>`
    }
    return temp(tokens, idx, options, env, slf)
  }
}

export default highlightPlugin
