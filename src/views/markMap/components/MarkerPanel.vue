<template>
  <div v-show="isShow" class="control-panel" @mouseover.native="this.$emit('dragLimit')" @mouseout.native="this.$emit('dragAdmit')">
    <div class="panel-top">
      <span>标绘管理</span>
      <i :class="isMarkerShown ? 'el-icon-turn-off' : 'el-icon-open'" @click="displayControl" />
    </div>
    <div class="select">
      <span> 类型：</span>
      <el-select default-value="allTypes" style="width: 100px" size="small" :value="markType" @change="handleChange">
        <el-option
          v-for="type in markTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
    </div>
    <div class="search">
      <el-input v-model="searchText" style="width: 150px" size="small" />
      <el-button slot="append" size="small" icon="el-icon-search" @click="handleSearch(searchText)" />
    </div>
    <div class="marker-table">
      <el-table
        :data="showMarkerData"
        height="340"
        border
        fit
        :header-row-style="headRowStyle"
        :header-cell-style="headCellStyle"
        :row-style="rowStyle"
        :cell-style="cellStyle"
        style="margin-left:10px;width: 380px"
      >
        <el-table-column
          prop="remark"
          label="备注"
          :show-overflow-tooltip="true"
          align="center"
          width="160"
        />
        <el-table-column
          prop="operation"
          align="center"
          label="操作"
        >
          <template v-slot="scope" class="operation">
            <a title="编辑" href="javascript:" @click="handleEdit(scope.row)"><i class="el-icon-edit-outline" /></a>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定删除吗?" @onConfirm="handleDelete(scope.row)">
              <a slot="reference" title="删除"><i class="el-icon-delete" /></a>
            </el-popconfirm>
            <el-divider direction="vertical" />
            <a title="定位" href="javascript:" @click="handleLocation(scope.row)"><i
              class="el-icon-location-information"
            /></a>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarkerPanel',
  props: {
    isShow: Boolean,
    isMarkerShown: Boolean,
    pointType: {
      type: String,
      default: null
    },
    showMarkerData: {
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
  data() {
    return {
      markType: 'allTypes',
      markTypes: [
        {
          label: '全部',
          value: 'allTypes'
        }, {
          label: '点',
          value: 'Point'
        }, {
          label: '线',
          value: 'LineString'
        }, {
          label: '面',
          value: 'Polygon'
        }, {
          label: '航线',
          value: 'MultiLineString'
        }
      ],
      searchText: ''
    }
  },
  methods: {
    handleChange(type) {
      this.markType = type
      this.$emit('query-marker', null, type)
    },
    // 表格中编辑按钮
    handleEdit(record) {
      this.$emit('edit-marker-data', record)
    },
    // 删除
    handleDelete(record) {
      this.$emit('delete-marker-data', record)
    },
    // 定位
    handleLocation(record) {
      this.$emit('marker-locate', record)
    },
    // 搜索
    handleSearch(value) {
      this.$emit('query-marker', value, null)
    },
    // 控制标记显示
    displayControl() {
      this.$emit('display-control')
    }
  }
}
</script>

<style scoped>

</style>
