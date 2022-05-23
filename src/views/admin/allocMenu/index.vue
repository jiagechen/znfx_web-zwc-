<template>
  <div class="dashboard-container">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AllocMenu',
  computed: {
    ...mapGetters(['name'])
  },
  mounted() {

  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding:24px;
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }

}
</style>
