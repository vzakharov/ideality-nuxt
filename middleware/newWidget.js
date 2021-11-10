import Bubble from '~/plugins/bubble'

export default function({ store: { $auth }, redirect, route: { query: { template }}}) {

  if ( !template )
    template = '1634290102528x190392032750235070'

  let bubble = new Bubble({$auth})
  bubble.go('createWidget', { template }).then(({ widget }) => {
    console.log(widget)
    redirect({name: 'widget-id-config', params: {id: widget.id}})
  })


}