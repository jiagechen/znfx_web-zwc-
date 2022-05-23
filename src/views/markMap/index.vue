<template>
  <div style="height: 670px;">
    <l-map
      ref="map"
      style="height: 100vh; width: 100%"
      :zoom="zoom"
      :center="center"
    >
      <l-tile-layer :url="url" />
      <l-control position="topright">
        <control-marker
          :map="map"
          @perspective="perspective"
          @mouseover.native="dragLimit"
          @mouseout.native="dragAdmit"
        />
      </l-control>
    </l-map>
  </div>
</template>

<script>
import { LMap, LTileLayer, LControl } from 'vue2-leaflet'
// import L from 'leaflet'
import ControlMarker from '@/views/markMap/components/ControlMaker'

export default {
  name: 'MarkMap',
  components: {
    LMap,
    LTileLayer,
    LControl,
    ControlMarker
  },
  data() {
    return {
      url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      zoom: 3,
      center: [47.413220, -1.219482],
      bounds: null,
      map: null
    }
  },
  mounted() {
    this.map = this.$refs.map.mapObject
  },
  methods: {
    perspective(center) {
      this.center = center
    },
    dragLimit() {
      this.map.dragging.disable()
      this.map.doubleClickZoom.disable()
      this.map.scrollWheelZoom.disable()
    },
    dragAdmit() {
      this.map.dragging.enable()
      this.map.doubleClickZoom.enable()
      this.map.scrollWheelZoom.enable()
    }
  }
}
</script>
<style scoped>
.control-panel .search .ant-input-search-enter-button .ant-input-group-addon .ant-input-search-button{
  font-size: 18px;
  color: #5e5656;
  background-color: #fff;
  border-color: #d9d9d9;
}
.control-panel .ant-table-thead > tr > th, .ant-table-tbody > tr > td{
  padding: 12px 14px;
  word-break: break-all;
}
.leaflet-container .leaflet-control-attribution, .leaflet-container .leaflet-control-scale{
  display: none;
}
.leaflet-marker-markerTooltip{
  white-space: nowrap;
  float: left;
  margin-left: 15px;
  margin-top: -5px;
  background-color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 3px;
  box-shadow: 2px 2px 5px #888888;
  color: #000000;
  padding: 2px 5px;
  font-weight: bold;
  font-size: 12px;
  line-height: 16px;
  cursor: default;
}
</style>
