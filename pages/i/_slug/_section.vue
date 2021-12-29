<template>
  <MyContainer fluid>
    <b-nav tabs>
      <MyTab section="edit"/>
      <MyTab section="leads"/>
      <MyTab section="code"/>
      <MyTab section="unshare"/>
    </b-nav>
    <b-row v-if="build">
      
      <template v-if="section=='edit'">
        <b-nav class="m-2">
          <b-nav-form>
            <b-button @click="updateBuild" :variant="changed && !status ? 'primary' : 'light'" :disabled="!changed || status=='pending'">
              {{ status ? status == 'ok' ? 'Saved!' : 'Saving...' : 'Save' }}
            </b-button>
            <Copiable class="btn btn-light text-muted" :value="buildUrl().view">Copy link</Copiable>
            <b-modal v-model="firstTime" title="Here you go!" hide-header-close ok-only>
                <p>
                  Congratulations, your landing page is now live and ready to collect leads!
                </p>
                <p>
                  <b>Use this link for sharing:</b><br/>
                  <nuxt-link
                    :to="buildTarget().view"
                    v-text="buildUrl().view"
                  />
                  (<Copiable :value="buildUrl().view">copy</Copiable>)
                </p>
                <p>
                  <b>Use this link for editing (<span>SAVE IT!</span>)<br/></b>
                  <nuxt-link
                    :to="buildTarget().edit"
                    v-text="buildUrl().edit"
                  />
                  (<Copiable :value="buildUrl().edit">copy</Copiable>)
                </p>
                <b-form
                  v-if="!linkSent"
                  @submit.prevent="bubble.go('sendBuildLink', { build: build.id, secret, email }).then(() => linkSent=true)"
                >
                  <MyInput
                    caption="Send edit link to my email"
                    placeholder="Enter your email"
                    description="We won’t store your email and will only use it once to send you the link."
                    v-model="email"
                  />
                  <b-button :disabled="!email" type="submit" variant="outline-primary">
                    Send
                  </b-button>
                </b-form>
                <p v-else>
                  <em>Edit link sent to {{ email }}</em>!
                </p>
            </b-modal>
          </b-nav-form>
        </b-nav>
        <BuildEdit v-model="build.code" v-on="{setFields}"/>
      </template>

      <template v-if="section=='leads'">
        <template v-if="requests.length">
          <b-button variant="light" class="mt-2 small" @click="downloadCSV">
            Download CSV
          </b-button>
          <b-table
            :items="requests"
            :fields="['email', {
              key: 'createdDate',
              label: 'Date',
              formatter: value => ( new Date(value) ).toDateString()
            }, 'confirmed', 'comments']"
          />
        </template>
        <em v-else>No leads yet. Share <nuxt-link :to="buildTarget().view">your page</nuxt-link> to reach more people!</em>
      </template>

      <div v-if="section=='code'">
        <CodeInput :value="dump(build.code)" :name="build.name" disabled/>
      </div>

      <div v-if="section=='unshare'" class="mt-3">
        Currently, all pages made with Ideality are public. If you don’t want to keep sharing it, you can
          <a href="#" v-b-modal.delete
          >delete the page</a>.
          Your existing configuration will be downloaded as a YAML in case you need it further.
        <b-modal id="delete" hide-header hide-footer>
          <h3>Are you sure? There’s no undo!</h3>
          <MyInput
            :caption="`Type in “DELETE ${ build.name.toUpperCase() }” (in all caps) to confirm.`"
            v-model="confirmDeleteInput"
          />
          <b-button variant="danger"
            :disabled="confirmDeleteInput != `DELETE ${ build.name.toUpperCase() }`"
            @click.prevent="download(build.code, build.name, 'yaml'); bubble.go('deleteBuild', { build: build.id, secret }).then(() => $router.push({name: 'i-new'}))"
          >
            DELETE
          </b-button>
        </b-modal>
      </div>

    </b-row>
    <b-row v-else>
      <Loading message="Loading page data..."/>
    </b-row>

  </MyContainer>
</template>

<script>

  import Bubble from '~/plugins/bubble'
  import { chain, filter, find, forEach, map, mapValues, pick, values } from 'lodash'
  import dedent from 'dedent-js'
  import { appendRoute } from '~/plugins/helpers'
  import { dump } from 'js-yaml'

  export default {

    head: {

      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/json2csv'
        }
      ]
    },

    async middleware({ redirect, route, route: { params: { section }} }) {
      if ( !section )
        redirect(appendRoute({ route, params: { section: 'edit' }}))
    },
    
    data() {

      return {
        build: null,
        confirmDeleteInput: '',
        requests: [],
        status: '',
        pending: false,
        done: false,
        email: '',
        changed: false,
        linkSent: false,
        name: '',
        content: {},
        shared: false,
        secret: null,
        section: this.$route.params.section,
        widgets: null,
        hideDescription: false
      }

    },

    async mounted() {

      let { params: { slug }, query: { secret }} = this.$route

      this.syncLocal('builds', {
        where: { slug },
        select: ['secret', 'linkSent']
      })

      this.syncLocal('user', {
        select: 'email'
      })

      secret = secret || this.secret

      if ( slug && secret ) {
        Object.assign(this, await this.bubble.go('getBuild', { slug, secret }))
      }

      Object.assign(this, { secret })

    },

    computed: {

      buildEditRoute() {
        let { slug, secret } = this.build
        return {name: '12l', query: { slug, secret }}
      },

      buildRoute() {
        let { slug } = this.build
        return {name: 'b-slug', params: { slug }}
      },

      code({ widgets } = this) {
        if ( !widgets )
          return
        return {
          blocks: widgets.map(({
            content,
            display: { native: { componentName: type }}
          }) => ({
            content,
            type
          }))
        }
      },

      completed() {
        return this.widgets && !filter( this.widgets, widget => !widget?.content?.output ).length
      },

      firstTime: {
        get() {
          return this.$route.hash == '#firstTime'
        },

        set() {
          this.$router.push(this.appendRoute({ reset: { hash: true }}))
        }
      }

    },

    watch: {
      'build.code': {
        deep: true,
        handler(code, oldCode) {
          if ( this.build && oldCode ) {
            this.changed = true
            this.status = ''
          }
        }
      }
    },

    methods: {

      async createBuild({ code, name } = this) {
        this.status = 'pending'
        Object.assign(this, await this.bubble.go('createBuild', {
          code,
          name,
          public: true
        }))
        this.status = 'ok'
      },

      downloadCSV() {
        let fields = ['email', 'createdDate', 'confirmed', 'comments']

        let csv = json2csv.parse(this.requests.map(request => pick(request, fields)))

        const anchor = document.createElement('a')
        anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
        anchor.target = '_blank'
        anchor.download = `${this.build.slug}-leads.csv`
        anchor.click()
      },

      async updateBuild() {
        let { id, secret, code, name } = this.build
        this.status = 'pending'
        await this.bubble.go('updateBuild', {
          id,
          secret,
          code,
          name
        })
        this.changed = false
        this.status = 'ok'
      },

      dedent, map, dump
    }

  }

</script>

<style>
.close {
  box-sizing: content-box;
  width: 1em;
  height: 1em;
  padding: 0.25em 0.25em;
  border: 0;
  border-radius: 0.25rem;
  opacity: 0.5;
  float: right;
  background-color: transparent;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
}
</style>