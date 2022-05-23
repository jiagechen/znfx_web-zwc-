<template>
  <div v-show="isShow" class="control-panel">
    <div class="panel-top">
      <span>{{ panelName }}</span>
    </div>
    <el-button style="margin: 0 0 8px 10px" type="primary" size="mini" @click="showRouteData">显示航线</el-button>
    <div class="marker-table">
      <el-table
        :data="routeData"
        height="358"
        :header-row-style="headRowStyle"
        :header-cell-style="headCellStyle"
        :row-style="rowStyle"
        :cell-style="cellStyle"
        border
        fit
        style="margin-left:10px;width: 380px"
      >
        <el-table-column
          v-for="column in columns"
          :key="column.label"
          :show-overflow-tooltip="true"
          :label="column.label"
          :prop="column.prop"
          align="center"
          width="110px"
        />
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CentralRoute',
  props: {
    isShow: Boolean,
    panelName: {
      type: String,
      default: '暂无名称'
    },
    columns: {
      type: Array,
      default: () => []
    },
    routeData: {
      type: Array,
      default: () => []
    },
    headRowStyle: {
      type: Object,
      default: () => {}
    },
    headCellStyle: {
      type: Object,
      default: () => {}
    },
    rowStyle: {
      type: Object,
      default: () => {}
    },
    cellStyle: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    showRouteData() {
      // 调用父组件方法显示航迹
      this.$emit('show-routes', this.routeData)
    }
  }
}
</script>

<style></style>
