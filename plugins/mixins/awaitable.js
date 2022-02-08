export default function(key) {

  return {

    data() {

      let event = {
        done: null,
        end: () => {},
        start() {
          this.done = new Promise(resolve => this.end = resolve)
        }
      }

      return {
        [key]: event
      }

    }

  }

}