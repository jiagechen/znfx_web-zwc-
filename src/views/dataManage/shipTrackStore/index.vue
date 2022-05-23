<template style="padding: 20px">
  <div>

    <!-- 功能区域 -->
    <div style="margin: 10px 0">

      <!-- 去除新增功能，该数据是经过原始数据处理得来，不能够直接导入 或者 新增
      <el-button type="primary" style="margin-left: 5px" @click="addTrack">新增</el-button>
      <el-button type="primary">导入</el-button>
      -->
      <!--
      <el-button type="primary" style="margin-left: 5px" @click="exportData">导出(.xlsx)</el-button>
      <el-button type="primary" @click="exportDataCsv">导出(.csv)</el-button>
      -->
      <el-button type="primary" style="margin-left: 5px" @click="exportDialogVisible = true">导出</el-button>
      <!--<el-button type="primary" style="margin-left: 5px" @click="dialogimportdata = true">数据导入</el-button>-->
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="_id" label="航线ID" />
      <el-table-column prop="plane_id" label="plane_id" />
      <el-table-column prop="track_point_items.length" label="航迹点数量" />
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button
            @click="checkStack(scope.row)"
          >查看
          </el-button>
          <!-- 该功能删除，不能够直接添加航迹点，该数据是原始数据经过处理得来的
          <el-button @click="addPoint(scope.row._id)"
          >添加轨迹点</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row._id)">
              <template #reference>
                  <el-button >删除航线</el-button>
              </template>
          </el-popconfirm>
          -->
        </template>
      </el-table-column>
    </el-table>

    <div style="margin: 10px 0px">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      title="航迹点信息"
      width="80%"
      :before-close="handleClose"
    >
      <el-table :data="trackData" border style="width: 100%" height="250">
        <el-table-column fixed prop="latitude" label="维度" />
        <el-table-column prop="longitude" label="经度" />
        <el-table-column prop="heigt" label="高度" />
        <el-table-column prop="heading" label="方向" />
        <el-table-column prop="speed" label="速度" />
        <el-table-column prop="time_stamp" label="时间戳" />
        <!--
        <el-table-column fixed="right"  label="操作" >
            <template #default="scope">
                <el-button @click="handleEdit(scope.row)">修改</el-button>
                <el-popconfirm title="确定删除吗？" @confirm="deletePoint(trackid,scope.row.itemid)">
                    <template #reference>
                        <el-button >删除</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
        -->
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogVisible_trackLine"
      title="添加航线"
      width="80%"
      :before-close="handleClose"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="plane_id">
          <el-input v-model="form.plane_id" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible_trackLine = false">取 消</el-button>
          <el-button type="primary" @click="saveTrack">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogVisible_trackPoint"
      title="添加航迹点"
      width="80%"
      :before-close="handleClose"
    >
      <el-form :model="trackForm" label-width="120px">
        <el-form-item label="维度">
          <el-input v-model="trackForm.latitude" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="trackForm.longitude" />
        </el-form-item>
        <el-form-item label="高度">
          <el-input v-model="trackForm.heigt" />
        </el-form-item>
        <el-form-item label="方向">
          <el-input v-model="trackForm.heading" />
        </el-form-item>
        <el-form-item label="速度">
          <el-input v-model="trackForm.speed" />
        </el-form-item>
        <el-form-item label="时间戳">
          <el-input v-model="trackForm.time_stamp" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible_trackPoint = false">取 消</el-button>
          <el-button type="primary" @click="saveTrackPoint">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 下面弹框，用于选择导出文件是.xlsx格式，还是.csv格式 绑定exportDialogVisible用v-model，官网上给的不能绑定 -->
    <el-dialog
      :visible.sync="exportDialogVisible"
      title="导出文件"
      width="25%"
      :before-close="handleClose"
    >
      <div align="Center">
        <span>请选择文件导出格式：</span><br><br>
        <el-radio v-model="radio" label="1">.xlsx</el-radio>
        <el-radio v-model="radio" label="2">.csv</el-radio>
        <span slot="footer" class="dialog-footer">
          <br><br>
          <el-button @click="exportDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="chooseExportData()">确 定</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- 导入文件功能 -->
    <el-dialog
      :visible.sync="dialogimportdata"
      title="导入文件"
      width="25%"
      :before-close="handleClose"
    >
      <div align="Center">
        <span>请选择导入的文件类型</span><br><br>
        <el-radio v-model="chooseradio" label="1">飞机数据</el-radio>
        <el-radio v-model="chooseradio" label="2">船迹数据</el-radio>
        <span slot="footer" class="dialog-footer">
          <br><br>
          <el-button @click="dialogimportdata = false">取 消</el-button>
          <el-button type="primary" @click="func()">确 定</el-button>
        </span>
      </div>
    </el-dialog>
    <!-- test -->

  </div>
</template>

<script>
// @ is an alias to /src
import request from '@/utils/request'
import { trackToExcell, trackToCsv } from '@/api/ordering'

export default {
  name: 'ShipTrackStore',
  components: {},
  data() {
    return {
      radio: '1',
      exportDialogVisible: false,
      dialogVisible_trackLine: false,
      dialogVisible_trackPoint: false,
      dialogVisible: false,
      dialogimportdata: false,
      chooseradio: '1', // 选择文件类型，默认飞机数据
      trackData: [],
      search: '',
      currentPage: 1,
      pageSize: 5,
      total: 10,
      tableData: [],
      row: [], // 用于回调，标识scope.row
      form: {
        _id: '',
        plane_id: ''
      },
      trackid: '', // 轨迹的唯一标识
      trackForm: {
        itemid: '',
        longitude: '',
        latitude: '',
        heigt: '',
        heading: '',
        speed: '',
        time_stamp: ''
      }
    }
  },
  mounted() {
    // this.load()
  },
  created() { // 刚进入时调用
    this.load()
  },
  methods: {
    func() { // 跳转到数据导入页面
      window.location.href = '/dataManage/dataImport/?planeOrShipData=' + this.chooseradio
    },
    handleDelete(_id) {
      // console.log("test:",routeID)
      request.delete('/api/track/' + _id).then(res => {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
        this.load() // 刷新
      })
    }, // 删除某条航线的航迹点
    deletePoint(trackid, itemid) {
      // console.log("test:",routeID)
      request.delete('/api/track/deletePoint/' + trackid + '/' + itemid).then(res => {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
        this.load() // 刷新
      })
    },
    load() {
      request.get('http://192.168.3.26:8080/track', {
        params: {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          search: this.search
        }
      }).then(res => {
        console.log(res)
        this.tableData = res.data.list
        this.total = res.data.total
      })
    },
    chooseExportData() {
      if (this.radio === '1') {
        this.exportData()
      } else {
        this.exportDataCsv()
      }
      this.exportDialogVisible = false
    },
    exportData() { // 导出文件(.xlsx)
      trackToExcell().then((data) => {
        this.downloadFile(data)
      })
    },
    downloadFile(data) {
      if (!data) {
        this.$message({
          type: 'error',
          message: '导出失败'
        })
        return
      }
      console.log(data)
      const link = document.createElement('a')
      const blob = new Blob([data], {
        type: 'application/vnd.ms-excel'
      })
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)

      link.setAttribute('download', '民航航迹存储表' + '.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 友好型提示
      this.$message({
        type: 'success',
        message: '导出成功'
      })
    },
    exportDataCsv() { // 导出文件(.csv)
      trackToCsv().then((data) => {
        this.downloadFileCsv(data)
      })
    },
    downloadFileCsv(data) {
      if (!data) {
        this.$message({
          type: 'error',
          message: '导出失败'
        })
        return
      }
      console.log('data#############')
      console.log(data)
      const link = document.createElement('a')
      const blob = new Blob([data], {
        type: 'application/ms-txt'
      })
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)

      link.setAttribute('download', '民航航迹存储表' + '.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 友好型提示
      this.$message({
        type: 'success',
        message: '导出成功'
      })
    },
    addPoint(id) {
      this.dialogVisible_trackPoint = true
      this.trackForm = {}
      this.trackid = id
    },
    addTrack() {
      this.dialogVisible_trackLine = true
      this.form = {}
    },
    saveTrack() {
      if (this.form._id) { // id存在，为更新
        request.put('/api/track', this.form).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '更新成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.load() // 刷新表单的数据
          this.dialogVisible_trackLine = false // 关闭弹窗
        })
      } else { // 否则是添加
        request.post('/api/track', this.form).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.load() // 刷新表单的数据，一定要放在request内部，放在外部不起到刷新的作用
          this.dialogVisible_trackLine = false // 关闭弹窗
        })
      }
    },
    handleEdit(row) { // 对航迹点修改
      this.trackForm = JSON.parse(JSON.stringify(row))
      this.dialogVisible_trackPoint = true
    },
    saveTrackPoint() {
      if (this.trackForm.itemid) { // itemid存在，为更新
        request.post('/api/track/updatePoint/' + this.trackid, this.trackForm).then(res => {
          console.log(res)//
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '更新成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.load() // 刷新表单的数据
          this.dialogVisible_trackPoint = false // 关闭弹窗
          this.dialogVisible = false
          this.trackData = this.row.track_point_items
          this.row = []
          // this.trackData[0]
          // this.tableData[0] = this.trackData
          this.dialogVisible = true
        })
      } else { // 否则是添加
        request.post('/api/track/trackPoint/' + this.trackid, this.trackForm).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '添加成功'
            })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
          this.load() // 刷新表单的数据，一定要放在request内部，放在外部不起到刷新的作用
          this.dialogVisible_trackPoint = false // 关闭弹窗
        })
      }
    },
    checkStack(row) {
      this.trackData = row.track_point_items
      this.trackid = row._id
      this.dialogVisible = true
      this.row = row
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      this.currentPage = pageNum
      this.load()
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    }
  }
}
</script>
