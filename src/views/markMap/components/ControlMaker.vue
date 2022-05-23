<template>
  <div class="control-marker">
    <div>
      <el-button :disabled="tipPanel" type="primary" size="mini" @click="pointMarker">
        绘制点
      </el-button>
      <el-button :disabled="tipPanel" type="primary" size="mini" @click="lineMarker">
        绘制线
      </el-button>
      <el-button :disabled="tipPanel" type="primary" size="mini" @click="polygonMarker">
        绘制面
      </el-button>
      <el-button type="info" size="mini" @click="toggleControlPanel">
        标绘管理
      </el-button>
      <el-dropdown style="margin: 0 0 0 10px" split-button type="info" size="mini" @click="toggleRoutePanel">航线管理
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="toggleCentralRoutePanel">中心航线</el-dropdown-item>
          <el-dropdown-item divided @click.native="toggleMultiRoutePanel">原始航线</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <MarkerPanel
      :is-show="controlPanel"
      :is-marker-shown="markerShow"
      :show-marker-data="showMarkerData"
      :all-marker-data="allMarkerData"
      :head-row-style="headRowStyle"
      :head-cell-style="headCellStyle"
      :row-style="markRowStyle"
      :cell-style="cellStyle"
      @query-marker="queryMarker"
      @edit-marker-data="editMarkerData"
      @delete-marker-data="deleteMarkerData"
      @marker-locate="markerLocate"
      @display-control="markerDisplayControl"
    />
    <RoutePanel
      panel-name="中心航线管理"
      :is-show="centralRoutePanel"
      :columns="centralRouteColumns"
      :route-data="centralRouteData"
      :head-row-style="headRowStyle"
      :head-cell-style="headCellStyle"
      :row-style="routeRowStyle"
      :cell-style="cellStyle"
      @show-routes="showCentralRoutes"
    />
    <RoutePanel
      panel-name="原始航迹管理"
      :is-show="multiRoutePanel"
      :columns="multiRouteColumns"
      :route-data="multiRouteData"
      :head-row-style="headRowStyle"
      :head-cell-style="headCellStyle"
      :row-style="routeRowStyle"
      :cell-style="cellStyle"
      @show-routes="showMultiRoutes"
    />
    <TipPanel
      :is-show.sync="tipPanel"
      :point-type="pointType"
      :lat.sync="lat"
      :lng.sync="lng"
      :tip.sync="tip"
      :poly-points="polyPoints"
      @finish-tip="finishTip"
      @cancel-tip="cancelTip"
    />
  </div>
</template>

<script>
import L from 'leaflet'
import RoutePanel from '@/views/markMap/components/RoutePanel'
import MarkerPanel from '@/views/markMap/components/MarkerPanel'
import TipPanel from '@/views/markMap/components/TipPanel'
import MarkerData from '../class/MarkerData'

import { AntPath } from 'leaflet-ant-path'
import { nanoid } from 'nanoid'

export default {
  components: {
    TipPanel,
    RoutePanel,
    MarkerPanel
  },
  props: {
    map: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      menuList: [
        {
          name: '数据管理',
          children: [{
            name: '民船航迹目标数据'
          },
          {
            name: '航迹匹配表'
          },
          {
            name: ''
          }
          ]
        },
        {
          name: '标绘管理'
        }
      ],
      colors: ['#e4b85d', '#5de468', '#cc5bdf', '#5d73e4'],
      centralRouteColumns: [
        {
          prop: 'routeID',
          label: '航线ID'
        },
        {
          prop: 'Initia_latitude',
          label: '起始经度'
        },
        {
          prop: 'Initia_longitude',
          label: '起始纬度'
        },
        {
          prop: 'Target_latitude',
          label: '终止经度'
        },
        {
          prop: 'Target_longitude',
          label: '终止纬度'
        },
        {
          prop: 'Height',
          label: '航线高度'
        },
        {
          prop: 'Width',
          label: '航线宽度'
        }
      ],
      multiRouteColumns: [
        {
          prop: '_id',
          label: '航线ID'
        },
        {
          prop: 'plane_id',
          label: '航班ID'
        }
      ],
      tip: '暂无备注',
      lng: 0,
      lat: 0,
      // 航迹点坐标判重
      showRoutePoint: [],
      // 航迹坐标判重
      showRoute: [],
      polyPoints: [],
      placeOrRadar: 0,
      pointType: '',
      controlPanel: true,
      routePanel: false,
      centralRoutePanel: false,
      multiRoutePanel: false,
      tipPanel: false,
      markerShow: true,
      record: null,
      searchContent: null,
      markerAdd: null,
      tipLocation: null,
      allMarkerData: [],
      showMarkerData: [],
      showRouteData: [],
      centralRouteData: [
        {
          _id: '6269198092fa2c3592b970af',
          Height: '9479',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '0',
          'Target_latitude': '28.01380137638074',
          'Target_longitude': '120.65185546875001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b0',
          Height: '8473',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '1',
          'Target_latitude': '39.977120098439634',
          'Target_longitude': '116.3671875',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b1',
          Height: '10698',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '2',
          'Target_latitude': '30.675715404167743',
          'Target_longitude': '114.34570312',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b2',
          Height: '0',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '3',
          'Target_latitude': '34.74161249883172',
          'Target_longitude': '113.64257812',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b3',
          Height: '10988',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '4',
          'Target_latitude': '41.73852846935917',
          'Target_longitude': '123.53027343750001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b4',
          Height: '9784',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '5',
          'Target_latitude': '36.59788913307022',
          'Target_longitude': '101.77734375000001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b5',
          Height: '3528',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '6',
          'Target_latitude': '28.57487404744697',
          'Target_longitude': '115.92773437500001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b6',
          Height: '9753',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '7',
          'Target_latitude': '40.68063802521456',
          'Target_longitude': '109.81933593750001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b7',
          Height: '7498',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '8',
          'Target_latitude': '26.70635985763354',
          'Target_longitude': '106.74316406250001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b8',
          Height: '9174',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '9',
          'Target_latitude': '31.466153715024294',
          'Target_longitude': '104.78759765625001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970b9',
          Height: '8100',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '10',
          'Target_latitude': '22.836945920943855',
          'Target_longitude': '108.369140625',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970ba',
          Height: '10363',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '11',
          'Target_latitude': '30.29701788337205',
          'Target_longitude': '120.32226562500001',
          Width: '10'
        },
        {
          _id: '6269198092fa2c3592b970bb',
          Height: '8100',
          'Initia_latitude': '32.0639555946604',
          'Initia_longitude': '118.76220703125001',
          routeID: '12',
          'Target_latitude': '37.89219554724437',
          'Target_longitude': '112.50000000000001',
          Width: '10'
        }
      ],
      multiRouteData: [],
      pagination: {
        current: 1,
        pageSize: 5
      },
      routeRowStyle: {
        height: '6px',
        fontSize: '12px'
      },
      markRowStyle: {
        height: '6px',
        fontSize: '14px'
      },
      cellStyle: {
        padding: '4px'
      },
      headRowStyle: {
        height: '8px',
        padding: '2px'
      },
      headCellStyle: {
        padding: '4px'
      }
    }
  },
  created() {
    // 初始化一些符号属性
    this.markersLayer = L.geoJSON([], {
      style: function(feature) {
        return {
          color: '#237CC9',
          weight: 2,
          fillColor: '#237CC9',
          fillOpacity: 0.2
        }
      }
    }).addTo(this.map)
    this.currentMarkerGroup = L.layerGroup([]).addTo(this.map)
    this.marker_zindex = 2000
    this.moveMarker = L.marker([0, 0], {
      zIndexOffset: this.marker_zindex
    })
    this.moveIcon = L.marker([0, 0], {
      zIndexOffset: this.marker_zindex
    })
  },
  methods: {
    // 绘制点
    pointMarker(e) {
      this.pointType = 'Point'
      this.cancelMarkerListener()

      this.clickFunction = this.addClickMarker
      this.map.on('click', this.clickFunction, this)

      this.moveFunction = this.addMoveMarker
      this.map.on('mousemove', this.moveFunction, this)

      this.rightClickFunction = this.cancelMarkerListener
      this.map.on('contextmenu', this.rightClickFunction, this)

      e.stopPropagation()
    },
    // 绘制点符号添加到图层中
    addClickMarker(e) {
      // todo 截取小数点后两位？
      this.lng = e.latlng.lng
      this.lat = e.latlng.lat
      const clickLocation = [this.lat, this.lng]
      this.cancelMarkerListener()
      const pointMarker = L.marker(clickLocation).addTo(this.markersLayer)
      this.addTip(pointMarker)
    },
    // 添加移动符号事件
    addMoveMarker(e) {
      // 触发移动事件
      this.map.getContainer().style.cursor = 'pointer'
      this.moveMarker.addTo(this.currentMarkerGroup)
      this.moveMarker.setLatLng(e.latlng)
      this.moveMarker.setZIndexOffset(this.marker_zindex)
    },
    // 添加线符号
    lineMarker(e) {
      this.pointType = 'Line'
      this.cancelMarkerListener()

      this.polyPoints = []
      this.poly_line = new L.Polyline([], {
        color: '#237CC9',
        // opacity:0.6,
        weight: 2
      })// 折线
      this.dashLine = new L.Polyline([], {
        color: '#237CC9',
        // opacity:0.6,
        dashArray: [10, 10],
        weight: 2
      })

      this.clickFunction = this.addLineLatlng
      this.map.on('click', this.clickFunction, this)

      this.dblclickFunction = this.addLineMarker
      this.map.on('dblclick', this.dblclickFunction, this)

      this.moveFunction = this.addDashLine
      this.map.on('mousemove', this.moveFunction, this)

      this.rightClickFunction = this.cancelMarkerListener
      this.map.on('contextmenu', this.rightClickFunction, this)

      e.stopPropagation()
    },
    // 添加线绘制点
    addLineLatlng(e) {
      this.polyPoints.push([e.latlng.lat, e.latlng.lng])
    },
    // 添加线绘制结束点
    addLineMarker(e) {
      this.cancelMarkerListener()
      this.map.removeLayer(this.dashLine)
      if (this.polyPoints.length > 2) {
        // // 抛出最后一个冗余点
        this.polyPoints.pop()
        this.poly_line.setLatLngs(this.polyPoints).addTo(this.markersLayer)
        return this.addTip(this.poly_line, this.polyPoints[this.polyPoints.length - 1])
      }
    },
    // 在绘制线鼠标移动时显示虚线效果
    addDashLine(e) {
      this.map.getContainer().style.cursor = 'pointer'
      this.moveIcon.addTo(this.currentMarkerGroup)
      if (this.polyPoints.length > 0) {
        this.dashLine.setLatLngs(this.polyPoints)
        this.dashLine.addLatLng([e.latlng.lat, e.latlng.lng]).addTo(this.currentMarkerGroup)
        this.moveIcon.setIcon(L.divIcon({
          html: '<div class=\'leaflet-marker-markerTooltip\'>双击添加备注</div>',
          className: 'leaflet-marker-noDefaultDivIcon'
        }))
      } else {
        this.moveIcon.setIcon(L.divIcon({
          html: '<div class=\'leaflet-marker-markerTooltip\'>点击开始绘制，双击结束</div>',
          className: 'leaflet-marker-noDefaultDivIcon'
        }))
      }
      this.moveIcon.setLatLng(e.latlng)
      this.moveIcon.setZIndexOffset(this.marker_zindex + 20)
    },
    // 为绘制区域添加绘制事件
    polygonMarker(e) {
      this.cancelMarkerListener()
      this.polyPoints = []// 区域点
      this.poly_area = new L.Polygon([], {
        color: '#237CC9',
        weight: 2,
        fillColor: '#237CC9',
        fillOpacity: 0.2
      })
      this.poly_now = new L.Polygon([], {
        color: '#237CC9',
        weight: 2,
        dashArray: [10, 10],
        fillColor: '#237CC9',
        fillOpacity: 0.3
      })

      this.clickFunction = this.addPolyLatlng
      this.map.on('click', this.clickFunction, this)

      this.dblclickFunction = this.addPolygonMarker
      this.map.on('dblclick', this.dblclickFunction, this)

      this.moveFunction = this.addPolyNow
      this.map.on('mousemove', this.moveFunction, this)

      this.rightClickFunction = this.cancelMarkerListener
      this.map.on('contextmenu', this.rightClickFunction, this)

      e.stopPropagation()
    },
    // 添加区域绘制点
    addPolyLatlng(e) {
      this.polyPoints.push([e.latlng.lat, e.latlng.lng])
    },
    // 添加区域绘制结束点
    addPolygonMarker(e) {
      this.cancelMarkerListener()
      this.map.removeLayer(this.poly_now)

      if (this.polyPoints.length > 2) {
        this.polyPoints.pop()
        this.poly_area.setLatLngs(this.polyPoints).addTo(this.markersLayer)
        const tipLocation = this.polyPoints[this.polyPoints.length - 1]
        return this.addTip(this.poly_area, tipLocation)
      }
    },
    // 在绘制区域鼠标移动时显示虚线效果
    addPolyNow(e) {
      this.map.getContainer().style.cursor = 'pointer'
      this.moveIcon.addTo(this.currentMarkerGroup)
      if (this.polyPoints.length > 0) {
        this.poly_now.setLatLngs(this.polyPoints)
        this.poly_now.addLatLng([e.latlng.lat, e.latlng.lng]).addTo(this.currentMarkerGroup)
        this.moveIcon.setIcon(L.divIcon({
          html: '<div class=\'leaflet-marker-markerTooltip\'>双击添加备注</div>',
          className: 'leaflet-marker-noDefaultDivIcon'
        }))
      } else {
        this.moveIcon.setIcon(L.divIcon({
          html: '<div class=\'leaflet-marker-markerTooltip\'>点击开始绘制，双击结束</div>',
          className: 'leaflet-marker-noDefaultDivIcon'
        }))
      }
      this.moveIcon.setLatLng(e.latlng)
      this.moveIcon.setZIndexOffset(this.marker_zindex + 20)
    },
    // 添加绘制符号的备注信息
    addTip(markerAdd, tipLocation) {
      this.tipPanel = true
      this.markerAdd = markerAdd
      this.tipLocation = tipLocation
      return this.$refs.tipModal
    },
    // 添加备注信息时备注框确定按钮, 将标记添加到标记管理中
    finishTip() {
      this.tipPanel = false
      const type = this.markerAdd.toGeoJSON().geometry.type
      // 如果是修改符号，因为新加符号没有popup
      if (this.markerAdd._popup) {
        // 修改点坐标
        if (type === 'Point') {
          this.markerAdd.setLatLng([this.lat, this.lng])
          // todo 如果是雷达 修改标记样式
          if (this.placeOrRadar === 1) this.markerAdd.setIconUrl()
        } else { // 如果是线或者面，修改坐标
          this.markerAdd.setLatLngs(this.polyPoints)
        }
        this.bindPopupToMarker(this.markerAdd, this.tip, this.tipLocation)
        this.record.geometry = JSON.stringify(this.markerAdd.toGeoJSON().geometry)
        this.record.geometryObject = this.markerAdd.toGeoJSON().geometry
        this.record.marker = this.markerAdd
        this.record.remark = this.tip
        this.record.marker.openPopup()
      } else { // 如果是新增符号
        // 如果是点的话
        if (type === 'Point') this.markerAdd.setLatLng([this.lat, this.lng])
        // 如果是线或者面的话
        else this.markerAdd.setLatLngs(this.polyPoints)

        this.bindPopupToMarker(this.markerAdd, this.tip, this.tipLocation)
        const newMarkerData = new MarkerData(
          JSON.stringify(this.markerAdd.toGeoJSON().geometry),
          this.markerAdd.toGeoJSON().geometry,
          this.markerAdd,
          nanoid(),
          this.tip
        )
        if (this.tipLocation) {
          // 把点对象转化为字符串---存数据库
          // newMarkerData.tipLocation = this.tipLocation.toString()
          newMarkerData.tipLocation = this.tipLocation
        }
        this.allMarkerData.push(newMarkerData)
        this.showMarkerData.push(newMarkerData)
      }
      this.tip = '暂无备注'
    },
    // 备注框取消按钮
    cancelTip() {
      // 判断是新增取消还是新增取消
      if (!this.markerAdd._popup) {
        this.markerAdd.removeFrom(this.markersLayer)
      }
      this.tipPanel = false
    },
    // 绑定弹出标记---弹出框
    bindPopupToMarker(theMarker, theTip, tipLocation) {
      if (tipLocation != null) {
        theMarker.bindPopup(theTip, {
          autoPan: false,
          autoClose: false,
          className: 'leaflet-marker-markerTip',
          keepInView: false
        }).openPopup(L.latLng(tipLocation[0], tipLocation[1]))
      } else {
        theMarker.bindPopup(theTip, {
          autoClose: false,
          className: 'leaflet-marker-markerTip'
        }).openPopup()
      }
    },
    // 取消标记侦听器
    cancelMarkerListener() {
      if (this.clickFunction) this.map.off('click', this.clickFunction, this)
      if (this.dblclickFunction) this.map.off('dblclick', this.dblclickFunction, this)
      if (this.moveFunction) this.map.off('mousemove', this.moveFunction, this)
      if (this.rightClickFunction) this.map.off('contextmenu', this.rightClickFunction, this)
      if (this.map.hasLayer(this.currentMarkerGroup)) this.currentMarkerGroup.clearLayers()
    },
    // 隐藏所有标绘符号按钮
    markerDisplayControl() {
      this.markerShow = !this.markerShow
      this.allMarkerData.forEach((markerData) => {
        if (this.markerShow) {
          // 显示
          markerData.marker.addTo(this.markersLayer)
          this.bindPopupToMarker(markerData.marker, markerData.remark, markerData.tipLocation)
        } else {
          // 隐藏
          markerData.marker.removeFrom(this.markersLayer)
        }
      })
    },
    // 页码设置
    handleTableChange(pagination) {
      this.queryParam.pageNo = this.ipagination.current = pagination.current
    },
    toggleRoutePanel() {
      if (this.centralRoutePanel) this.centralRoutePanel = !this.centralRoutePanel
      if (this.multiRoutePanel) this.multiRoutePanel = !this.multiRoutePanel
    },
    // 切换符号控制面板的显示隐藏
    toggleControlPanel() {
      this.controlPanel = !this.controlPanel
      if (this.routePanel) this.routePanel = !this.routePanel
    },
    // 切换航线管理面板
    toggleCentralRoutePanel() {
      if (!this.centralRoutePanel) this.centralRoutePanel = !this.centralRoutePanel
      if (this.controlPanel) this.controlPanel = !this.controlPanel
    },
    // 切换多点航迹管理面板
    toggleMultiRoutePanel() {
      if (!this.multiRoutePanel) this.multiRoutePanel = !this.multiRoutePanel
      if (this.controlPanel) this.controlPanel = !this.controlPanel
    },
    // 显示只有开始结尾两个航迹点的航迹
    showCentralRoutes(routeData) {
      routeData.forEach((route, index) => {
        console.log(index)
        // 初始折线样式
        const poly_line = new AntPath([], {
          color: this.colors[index % 4],
          opacity: 0.8,
          dashArray: [15, 30],
          weight: 2
        })
        const routeTip = '航线ID:' + route.routeID + ', 航线高度' + route.Height + ', 航线宽度' + route.Width
        const startTip = '经度:' + route.Initia_latitude + ' 纬度:' + route.Initia_longitude
        const endTip = '经度:' + route.Target_latitude + ' 纬度:' + route.Target_longitude
        const start = [route.Initia_latitude, route.Initia_longitude]
        const end = [route.Target_latitude, route.Target_longitude]
        // 添加起始终止点标记点
        this.setStartAndEndMarker(start, startTip)
        this.setStartAndEndMarker(end, endTip)
        // 构建poly_line的轨迹坐标
        const coordinate = []
        coordinate.push(start, end)
        console.log(coordinate)
        // 设置航线的备注并添加到标记管理
        this.setRouteOrPoint(poly_line, coordinate, coordinate[coordinate.length - 1], routeTip, route._id)
      })
    },
    // 显示有多个航迹点的航迹
    showMultiRoutes(routeData) {
      // 遍历航迹
      routeData.forEach((route, index) => {
        // 初始折线样式
        const poly_line = new AntPath([], {
          color: this.colors[index % 4],
          opacity: 0.8,
          dashArray: [15, 30],
          weight: 2
        })
        const coordinate = []
        const routeTip = '航班ID:' + route.plane_id
        const startTip = '航班' + route.plane_id + '起始点'
        const endTip = '航班' + route.plane_id + '终止点'
        // 记录每个点的高度值
        const tracks = route.Track_point_items
        // 遍历每一个轨迹点
        tracks.forEach(track => {
          coordinate.push([track.latitude, track.longitude])
        })
        // 航迹起始点
        this.setStartAndEndMarker(coordinate[0], startTip)
        // 航迹终止点
        this.setStartAndEndMarker(coordinate[coordinate.length - 1], endTip)
        // 航迹
        this.setRouteOrPoint(poly_line, coordinate, coordinate[coordinate.length - 1], routeTip)
      })
    },
    // todo 还需要修改信息，更改筛选，提供筛选航线
    // 设置航线的详情信息，用于处理航迹(line)或者初始终止点
    setRouteOrPoint(markerAdd, coordinate, tipLocation, tip, routeId) {
      const newMarkerData = new MarkerData(
        JSON.stringify(markerAdd.toGeoJSON().geometry),
        markerAdd.toGeoJSON().geometry,
        markerAdd,
        routeId,
        tip
      )
      // 是起始终止点， 且点不存在
      if (this.isPoint(markerAdd) && !this.isPointExist(coordinate)) {
        // 设置关联航线id，以便在删除航迹同时删除端点
        newMarkerData.relateId = routeId
        markerAdd.setLatLng(coordinate).addTo(this.markersLayer)
        this.showRoutePoint.push(coordinate)
      } else if (this.isRoute(markerAdd) && !this.isRouteExist(coordinate)) { // 是航迹且航迹不存在
        markerAdd.setLatLngs(coordinate).addTo(this.markersLayer)
        this.showRoute.push(coordinate)
      }
      if (tip) this.bindPopupToMarker(markerAdd, tip, tipLocation)
      // 将标记点或航线放到标绘管理中
      this.allMarkerData.push(newMarkerData)
      this.showMarkerData.push(newMarkerData)
    },
    // 为航线两端设置标记点
    setStartAndEndMarker(coordinate, tip) {
      // 初始化标记点
      const pointMarker = L.marker(coordinate)
      this.setRouteOrPoint(pointMarker, coordinate, coordinate, tip)
    },
    // 由于leaflet存储的标记点经纬度是反过来的，所以要交换一下
    exchangeLatLng(points) {
      points.forEach((point) => {
        [point[0], point[1]] = [point[1], point[0]]
      })
    },
    isPoint(markerAdd) {
      return markerAdd.toGeoJSON().geometry.type === 'Point'
    },
    isRoute(markerAdd) {
      return markerAdd.toGeoJSON().geometry.type === 'MultiLineString'
    },
    isPointExist(coordinate) {
      return JSON.stringify(this.showRoutePoint).includes(JSON.stringify(coordinate))
    },
    isRouteExist(coordinate) {
      return JSON.stringify(this.showRoute).includes(JSON.stringify(coordinate))
    },
    // 修改点信息
    changePointInfo(newLat, newLng) {
      this.pointType = 'Point'
      this.lat = newLat
      this.lng = newLng
      this.tipLocation = [this.lat, this.lng]
    },
    // 修改线、面的处理
    changePointsInfo(type, newPoints) {
      this.pointType = type
      this.exchangeLatLng(newPoints)
      this.polyPoints = newPoints
      this.tipLocation = newPoints[newPoints.length - 1]
    },
    // 修改通用信息
    changeCommonInfo(record) {
      this.tipPanel = true
      this.tip = record.remark
      this.record = record
      this.markerAdd = record.marker
      this.perspective(record)
    },
    // 编辑标记
    editMarkerData(record) {
      const type = record.geometryObject.type
      // 如果是点， 在表单中显示编辑的信息
      if (type === 'Point') this.changePointInfo(record.geometryObject.coordinates[1], record.geometryObject.coordinates[0])
      else { // 如果是线或者面
        let points = []
        // 如果是多边形
        switch (type) {
          case 'Polygon':
            points = record.geometryObject.coordinates[0]
            points.pop()
            break
          case 'MultiLineString':
            points = record.geometryObject.coordinates[0]
            break
          case 'LineString':
            points = record.geometryObject.coordinates
            break
        }
        this.changePointsInfo(type, points)
      }
      this.changeCommonInfo(record)
      // 弹出标记
      // record.marker.openPopup()
    },
    // 删除标记
    deleteMarkerData(record) {
      this.allMarkerData.splice(this.allMarkerData.indexOf(record), 1)
      this.showMarkerData.splice(this.showMarkerData.indexOf(record), 1)
      record.marker.removeFrom(this.markersLayer)
    },
    markerLocate(record) {
      this.perspective(record)
      record.marker.openPopup()
    },
    // 关键字搜索标记
    queryMarker(value, type) {
      console.log(value)
      this.showMarkerData = []
      this.allMarkerData.forEach((markerData) => {
        if (value) { // 有搜索关键字
          if (markerData.geometryObject.type === type && markerData.remark.indexOf(value) !== -1) this.showMarkerData.push(markerData)
          else if (type === 'allTypes' && markerData.remark.indexOf(value) !== -1) this.showMarkerData.push(markerData)
        } else { // 没有搜索关键字
          if (markerData.geometryObject.type === type) this.showMarkerData.push(markerData)
          else if (type === 'allTypes') this.showMarkerData.push(markerData)
        }
      })
    },
    perspective(record) {
      if (record.tipLocation) {
        this.$emit('perspective', record.tipLocation)
      } else {
        this.$emit('perspective', record.marker._latlng)
      }
    }
  }
}
</script>
<style lang="scss">
.add-tip {
  display: flex;
  flex-direction: column;
  width: 200px;
  max-height: 400px;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 4px;
  position: absolute;
  top: 0;
  right: 320px;
  overflow: scroll;

  & .title {
    width: 100%;
    color: #000;
    font-size: 14px;
    text-align: center;
  }

  & .ok {
    margin: 8px 0 0 20px;
  }

  & .cancel {
    margin: 8px 0 0 30px;
  }

  & .panel-input {
    width: 120px;
    margin: 5px 0 0 0;
  }
}
.control-panel {
  width: 400px;
  height: 500px;
  background-color: #fff;
  border-radius: 4px;
  overflow: auto;
  position: absolute;
  top: 50px;
  left: 0px;

  & .panel-top {
    margin: 10px;
    color: rgb(47, 192, 226);
    font-size: 16px;
  }

  & .panel-top i {
    float: right;
    color: #000;
    margin-right: 20px;
  }

  & .select {
    display: inline-block;
    margin: 10px 0 0 10px;
    font-size: 14px;
  }

  & .search {
    display: inline-block;
    margin: 10px;
  }

  & .search .ant-input-search-enter-button .ant-input-group-addon .ant-input-search-button {
    font-size: 16px;
    color: #d9d9d9;
    background-color: #fff;
    border-color: #d9d9d9;
  }

  & .search .ant-btn-primary {
    background-color: #fff;
    border-color: #d9d9d9;
  }
}
</style>
