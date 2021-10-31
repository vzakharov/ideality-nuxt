import Bubble from '~/plugins/bubble'

export default function({ store: { $auth }, redirect, route: { query: { template }}}) {

  if ( !template )
    template = '1634290102528x190392032750235070'

  console.log({template})
  
  let bubble = new Bubble({$auth})
  bubble.go('createWidget', { template }).then(({ widget }) => {
    console.log(widget)
    redirect({name: 'dashboard-widget-id', params: {id: widget.id}})
  })


}