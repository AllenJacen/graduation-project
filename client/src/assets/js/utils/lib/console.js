const console = {}
import each from 'lodash/each';
import keysIn from 'lodash/keysIn';

each(keysIn(window.console), (name) => {
  console[name] = (...args) => {
    localStorage.debug && window.console[name](...args)
  }
})

export default console
