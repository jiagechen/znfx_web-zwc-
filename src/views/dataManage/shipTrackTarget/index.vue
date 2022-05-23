<template style="padding: 20px">
  <div>

    <!-- 功能区域 -->
    <div style="margin: 10px 0">
      <!-- 搜索区域 -->
      <!--<el-input v-model="search" placeholder="请输入关键字" style="width: 20%;margin-left: 5px" />-->
      <!--<el-button type="primary" style="margin-left: 5px" @click="load">查询</el-button>-->

      <el-button type="primary" @click="add">新增</el-button>
      <!--
      <el-button type="primary" style="margin-left: 5px" @click="exportData">导出(.xlsx)</el-button>
      <el-button type="primary" @click="exportDataCsv">导出(.csv)</el-button>
      -->
      <el-button type="primary" style="margin-left: 5px" @click="exportDialogVisible = true">导出</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed prop="shipId" label="数据包标志" />
      <el-table-column prop="fragmentNum" label="累计片段数" />
      <el-table-column prop="nowFragment" label="当前片段数" />
      <el-table-column prop="fmId" label="无线电信号代码" />
      <el-table-column prop="dataPacket" label="数据包" />
      <el-table-column prop="checkData" label="数据完整性检查" />
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @onConfirm="handleDelete(scope.row._id)">
            <el-button slot="reference">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin: 10px 0px">
      <el-pagination
        :page-sizes="[5, 10, 20]"
        :page-size="5"
        :current-page="currentPage"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <el-dialog
        :visible.sync="dialogVisible"
        title="提示"
        width="35%"
        :before-close="handleClose"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="数据包标志" prop="shipId">
            <el-input v-model="form.shipId" maxlength="50" placeholder="最多50个字符" />
            <!-- maxlength="50"，限制输入框最长输入为50 -->
          </el-form-item>
          <el-form-item label="累计片段数" prop="fragmentNum">
            <el-input
              v-model="form.fragmentNum"
              v-d-input-int
              v-d-input-max="2147483647"
              placeholder="请输入正整数"
            />
            <!-- v-d-input-int v-d-input-max="2147483647"  限制输入为正整数，且在int类型范围内 -->
          </el-form-item>
          <el-form-item label="当前片段数" prop="nowFragment">
            <el-input
              v-model="form.nowFragment"
              v-d-input-int
              v-d-input-max="2147483647"
              placeholder="请输入正整数"
            />
          </el-form-item>
          <el-form-item label="无线电代码" prop="fmId">
            <el-input
              v-model="form.fmId"
              type="number"
              step="0.001"
              max="9.999"
              min="0.000"
              placeholder="数据范围为：0.000~9.999"
              oninput="if(isNaN(value)) { value = parseFloat(value) } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+4)} if(value<0){value=0.000} if(value>9.999){value=9.999}"
            >
              <!--
              type="number"：类型为数字
              step="0.001"，每次增加0.001
              max="9.999"，最大值为9.999
              min="0"，最小值为0
              placeholder：提示
              oninput：限制直接输入的最大值，最小值，小数点后位数
              -->
            </el-input>
          </el-form-item>
          <el-form-item label="数据包" prop="dataPacket">
            <el-input v-model="form.dataPacket" />
          </el-form-item>
          <el-form-item label="数据完整检查" prop="checkData">
            <el-input v-model="form.checkData" type="textarea" />
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

  </div>
</template>

<script>
// @ is an alias to /src

// import {Axios as request} from "axios";错误
import request from '@/utils/request'
import { shipTrackToExcell, shipTrackToCsv } from '@/api/ordering'

export default {
  name: 'HomeView',
  components: {},
  data() {
    return {
      radio: '1',
      exportDialogVisible: false,
      form: {
        id: '',
        shipId: '',
        fragmentNum: '',
        nowFragment: '',
        fmId: '',
        dataPacket: '',
        checkData: '',
        fragmentId: ''
      },
      rules: {
        shipId: [
          { required: true, message: '请输入数据包标志', trigger: 'blur' }
        ],
        fragmentNum: [
          { required: true, message: '请输入累积片段数', trigger: 'blur' }
        ],
        nowFragment: [
          { required: true, message: '请输入当前片段数', trigger: 'blur' }
        ],
        fmId: [
          { required: true, message: '请输入无线电信号代码', trigger: 'blur' }
        ],
        dataPacket: [
          { required: true, message: '请输入数据包', trigger: 'blur' }
        ],
        checkData: [
          { required: true, message: '请输入数据包完成性检查', trigger: 'blur' }
        ]
      },
      search: '',
      dialogVisible: false,
      currentPage: 1,
      pageSize: 5,
      total: 0,
      tableData: []
    }
  },
  created() { // 刚进入时调用
    this.load()
  },
  methods: {
    handleDelete(fragmentId) {
      console.log('test:', fragmentId)
      request.delete('http://localhost:8080/shiptrack/' + fragmentId).then(res => {
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
    add() {
      this.dialogVisible = true
      this.form = {}
    },
    save(form) {
      // 验证表单是否为空，为空则提示，不提交
      this.$refs[form].validate((valid) => {
        if (!valid) {
          return false
        } else {
          if (this.form.fragmentId) { // id存在，为更新
            request.put('http://localhost:8080/shiptrack', this.form).then(res => {
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
            request.post('http://localhost:8080/shiptrack', this.form).then(res => {
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
    load() {
      request.get('http://localhost:8080/shiptrack/all', { // 获取所有数据
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
      shipTrackToExcell().then((data) => {
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

      link.setAttribute('download', '民船航迹存储表' + '.xlsx')
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
      shipTrackToCsv().then((data) => {
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

      link.setAttribute('download', '民船航迹存储表' + '.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 友好型提示
      this.$message({
        type: 'success',
        message: '导出成功'
      })
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))// 此处采用深拷贝 ，与之前的form并非是同一个对象
      this.dialogVisible = true
    },
    handleSizeChange(pageSize) { // 改变当前每页的个数触发
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) { // 改变当前页码触发
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
