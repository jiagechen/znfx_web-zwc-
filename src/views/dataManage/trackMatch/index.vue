<template style="padding: 20px">
  <div>

    <!-- 功能区域 -->
    <div style="margin: 10px 0">
      <!-- 搜索区域 -->
      <el-input v-model="search" placeholder="请输入关键字" style="width: 20%;margin-left: 5px" />
      <el-button type="primary" style="margin-left: 5px" @click="load">查询</el-button>

      <el-button type="primary" @click="add">新增</el-button>
      <!--
      <el-button type="primary" style="margin-left: 5px" @click="exportData">导出(.xlsx)</el-button>
      <el-button type="primary" @click="exportDataCsv">导出(.csv)</el-button>
      -->
      <el-button type="primary" style="margin-left: 5px" @click="exportDialogVisible = true">导出</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="initiaLatitude" label="起点维度" />
      <el-table-column prop="initiaLongitude" label="起点经度" />
      <el-table-column prop="angel" label="航线角度" />
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button
            @click="handleEdit(scope.row)"
          >编辑
          </el-button>
          <el-popconfirm title="确定删除吗？" @onConfirm="handleDelete(scope.row.routeID)">
            <template #reference>
              <el-button>删除</el-button>
            </template>
          </el-popconfirm>
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
      title="提示"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="起点维度" prop="initiaLatitude">
          <el-input
            v-model="form.initiaLatitude"
            type="number"
            step="0.00001"
            max="999.99999"
            min="0.00000"
            placeholder="数据范围为：0.00000~999.99999"
            oninput="if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+6)} if(value<-999.99999){value=-999.99999} if(value>999.99999){value=999.99999}"
          />
        </el-form-item>
        <el-form-item label="起点经度" prop="initiaLongitude">
          <el-input
            v-model="form.initiaLongitude"
            type="number"
            step="0.00001"
            max="999.99999"
            min="0.00000"
            placeholder="数据范围为：0.00000~999.99999"
            oninput="if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+6)} if(value<-999.99999){value=-999.99999} if(value>999.99999){value=999.99999}"
          />
        </el-form-item>
        <el-form-item label="航线角度" prop="angel">
          <el-input
            v-model="form.angel"
            type="number"
            placeholder="输入类型为浮点数"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="save('form')">确 定</el-button>
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
  </div>
</template>

<script>
// @ is an alias to /src
import request from '@/utils/request'
import { matchTrackToExcell, matchTrackToCsv } from '@/api/ordering'

export default {
  name: 'TrackMatch',
  components: {},
  data() {
    return {
      radio: '1',
      exportDialogVisible: false,
      dialogVisible: false,
      form: {
        routeID: '',
        initiaLatitude: '',
        initiaLongitude: '',
        angel: ''
      },
      rules: {
        initiaLatitude: [
          { required: true, message: '请输入起点维度', trigger: 'blur' }
        ],
        initiaLongitude: [
          { required: true, message: '请输入起点维度', trigger: 'blur' }
        ],
        angel: [
          { required: true, message: '请输入角度', trigger: 'blur' }
        ]
      },
      search: '',
      currentPage: 1,
      total: 10,
      pageSize: 5,
      tableData: []
    }
  },
  created() { // 刚进入时调用
    this.load()
  },
  methods: {
    handleDelete(routeID) {
      console.log('test:', routeID)
      request.delete('http://localhost:8080/matchtrack/' + routeID).then(res => {
        if (res.code === '200') {
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
      request.get('http://localhost:8080/matchtrack', {
        params: {
          pageNum: this.currentPage,
          pageSize: this.pageSize,
          search: this.search
        }
      }).then(res => {
        console.log(res)
        this.tableData = res.data.records
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
      matchTrackToExcell().then((data) => {
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

      link.setAttribute('download', '航线匹配表' + '.xlsx')
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
      matchTrackToCsv().then((data) => {
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

      link.setAttribute('download', '航线匹配表' + '.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 友好型提示
      this.$message({
        type: 'success',
        message: '导出成功'
      })
    },
    add() {
      this.dialogVisible = true
      this.form = {}
    },
    save(form) {
      // 表单提交的非空验证
      this.$refs[form].validate((valid) => {
        if (!valid) {
          return false
        } else {
          if (this.form.routeID) { // id存在，为更新
            request.put('http://localhost:8080/matchtrack', this.form).then(res => {
              console.log(res)
              if (res.code === '200') {
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
              this.dialogVisible = false // 关闭弹窗
            })
          } else { // 否则是添加
            request.post('http://localhost:8080/matchtrack', this.form).then(res => {
              console.log(res)
              if (res.code === '200') {
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
              this.dialogVisible = false // 关闭弹窗
            })
          }
        }
      })
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))// 此处采用深拷贝 ，与之前的form并非是同一个对象
      this.dialogVisible = true
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
