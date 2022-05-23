<template style="padding: 20px">
  <div>
    <!-- 功能区域 -->
    <div style="margin: 10px 0">
      <el-button type="primary" style="margin-left: 5px" @click="exportDialogVisible = true">导出</el-button>
      <!--<el-button type="primary" style="margin-left: 5px" @click="exportDataCsv()">导出csv</el-button>-->
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="_id" label="ID" />
      <el-table-column fixed prop="avgSpeed" label="平均速度" />
      <el-table-column fixed prop="avgHeight" label="平均高度" />
      <el-table-column fixed="right" label="航线次数统计">
        <template #default="scope">
          <el-button @click="checkStack(scope.row)">查看
          </el-button>
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
    <el-dialog
      :visible.sync="dialogVisible"
      title="航迹点信息"
      width="80%"
      :before-close="handleClose"
    >
      <div>
        <el-table :data="trackData" border style="width: 100%" height="250">
          <el-table-column fixed prop="key" label="航线编号" />
          <el-table-column prop="value" label="统计次数" />
        </el-table>
      </div>
      <div ref="myChart" class="map" />
      <template #footer>
        <span class="dialog-footer">
          <!--<el-button @click="dialogVisible = false">取 消</el-button>-->
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import { clusterToExcell, clusterToCsv } from '@/api/ordering'
// import * as echarts from 'echarts'

export default {
  name: 'ClusterProperty',
  data() {
    return {
      exportDialogVisible: false,
      radio: '1',
      tableData: [],
      currentPage: 1,
      pageSize: 5,
      total: 0,
      trackData: [],
      trackid: '', // 每条数据的标识id
      dialogVisible: false, // 展示对话框
      myChart: null// 图形展示
    }
  },
  created() {
    this.load()
  },
  methods: {
    checkStack(row) {
      var data = row.targetTimes
      this.trackData = []
      for (var key in data) {
        this.trackData.push({ 'key': key, 'value': data[key] })
      }
      this.trackid = row._id
      this.dialogVisible = true
      this.row = row
      // var charDom = document.getElementById("chartshow") //初始化图表
      /* this.myChart = echarts.init(this.$refs.myChart,null,{
          width: 850,
          height: 600
      })
      var option = {
          xAxis: {
              name: '航线编号',
              type: 'category',
              data: ['航线1', '航线2\n航线3\n航线4', '1次']
          },
          yAxis: {
              name: '出现次数',
              type: 'value'
          },
          series: [
              {
                  data: [1,3,2],
                  type: 'bar',
                  showBackground: true,
                  backgroundStyle: {
                      color: 'rgba(180, 180, 180, 0.2)'
                  }
              }
          ]
      }
      option && this.myChart.setOption(option)
      // 绑定监听事件 图形屏幕自适应
      window.addEventListener('resize', this.resize, false);*/
    },
    load() {
      request.get('http://localhost:8080/clusterproperty', {
        params: {
          pageNum: this.currentPage,
          pageSize: this.pageSize
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
    },
    exportData() { // 导出文件(.xlsx)
      clusterToExcell().then((data) => {
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

      link.setAttribute('download', '航迹次数统计表' + '.xlsx')
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
      clusterToCsv().then((data) => {
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

      link.setAttribute('download', '航线次数统计表' + '.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 友好型提示
      this.$message({
        type: 'success',
        message: '导出成功'
      })
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

<style scoped>

</style>
