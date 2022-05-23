<template>
  <div v-show="isShow" ref="tipModal" class="add-tip">
    <div class="title">标记信息</div>
    <div>备注：
      <el-input v-model="innerTip" class="panel-input" size="mini" placeholder="请输入备注" clearable />
    </div>
    <el-radio-group v-if="pointType === 'Point'" v-model="placeOrRadar" size="mini" style="margin: 8px 2px 4px 2px">
      <el-radio :label="0">地标点</el-radio>
      <el-radio :label="1">雷达点</el-radio>
    </el-radio-group>
    <div v-if="pointType === 'Point'">经度：
      <el-input v-model="innerLat" class="panel-input" size="mini" placeholder="请输入经度" clearable />
    </div>
    <div v-if="pointType === 'Point'">纬度：
      <el-input v-model="innerLng" class="panel-input" size="mini" placeholder="请输入维度" clearable />
    </div>
    <template v-else>
      <div v-for="(point, index) in polyPoints">
        <span style="font-weight: bold">点{{ index + 1 }}</span>
        <div>经度：<el-input v-model.number="point[0]" class="panel-input" size="mini" placeholder="请输入经度" clearable /></div>
        <div>纬度：<el-input v-model.number="point[1]" class="panel-input" size="mini" placeholder="请输入经度" clearable /></div>
      </div>
    </template>
    <div style="display: flex;">
      <el-button class="ok" type="primary" size="mini" @click="tipOk">确定</el-button>
      <el-button class="cancel" type="danger" size="mini" @click="tipCancel">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TipPanel',
  props: {
    isShow: Boolean,
    pointType: {
      type: String,
      default: null
    },
    placeOrRadar: {
      type: Number,
      default: 0
    },
    lat: {
      type: Number,
      default: 0
    },
    lng: {
      type: Number,
      default: 0
    },
    tip: {
      type: String,
      default: '暂无备注'
    },
    polyPoints: {
      type: Array,
      default: () => {}
    }
  },
  computed: {
    innerTip: {
      get() { return this.tip },
      set(val) { this.$emit('update:tip', val) }
    },
    innerLat: {
      get() { return this.lat },
      set(val) { this.$emit('update:lat', val) }
    },
    innerLng: {
      get() { return this.lng },
      set(val) { this.$emit('update:lng', val) }
    }
  },
  methods: {
    tipOk() {
      this.$emit('finish-tip')
    },
    tipCancel() {
      this.$emit('cancel-tip')
    }
  }
}
</script>

<style scoped>

</style>
