<template>
  <div id="app" align="center">
    <!-- 上传组件 -->
    <el-upload action drag :auto-upload="false" :show-file-list="false" :on-change="handleChange" :accept="acceptType">
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">大小不超过 2G 的{{ datatype == '1' ? "txt/csv的飞机" : "csv的船迹" }}数据</div>
    </el-upload>

    <div>
      <span>{{ dataMsg }}</span>
    </div>
    <!-- 进度显示 -->
    <div class="progress-box">
      <span>上传进度：{{ percent.toFixed() }}%</span>
      <!--<el-button type="primary" size="mini" @click="handleClickBtn">{{ upload | btnTextFilter }}</el-button>-->
    </div>
    <div class="progress-box">
      <span>请选择文件类型：</span>
      <el-radio v-model="datatype" label="1" @change="changeDataType">飞机数据</el-radio>
      <el-radio v-model="datatype" label="2" @change="changeDataType">船迹数据</el-radio>
    </div>

    <!-- 展示上传成功的文件 -->
    <div v-if="videoUrl">
      <video :src="videoUrl" controls />
    </div>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
import axios from 'axios'

export default {
  name: 'Upload',
  path: '/upload',
  filters: {
    btnTextFilter(val) {
      return val ? '暂停' : '继续'
    }
  },
  data() {
    return {
      datatype: '1', // 1：飞机数据 2：船迹数据
      acceptType: '.txt,.csv', // 支持的文件类型
      dataMsg: '未选择文件', // 提示信息："" / "数据处理完毕,上传中..." / "数据处理中，请等待..." / "数据导入完成"
      // dataWasProcessed:false,//dataWasProcessed = false:前端数据未处理完毕，true：处理完毕
      dataProcessState: 0, // 0：未选择文件 1：数据处理中，请等待 2：数据处理完毕，导入中 3：数据导入完毕
      percent: 0,
      videoUrl: '',
      upload: true,
      percentCount: 0,
      totalCnt: 0, // 总共文件分的份数,
      sentCnt: 0, // 文件已经发送的分数
      fileType: '' // 文件类型
    }
  },
  mounted() {
    this.getRequest()
    this.dataMsg = '未选择文件'
    console.log('planeOrShipData')
    console.log(this.planeOrShipData)
  },
  methods: {
    changeDataType() {
      // eslint-disable-next-line eqeqeq
      if (this.datatype == '1') {
        this.acceptType = '.txt,.csv'
      } else {
        this.acceptType = '.csv'
      }
    },
    exit() {
      window.location.href = '/shipTrackStore'
    }, // 退出
    getRequest() { // 获取跳转过来的参数
      var url = location.search // 获取url中"?"符后的字串
      // eslint-disable-next-line no-new-object
      var theRequest = new Object()
      let strs
      // eslint-disable-next-line eqeqeq
      if (url.indexOf('?') != -1) {
        var str = url.substr(1)
        strs = str.split('&')
        for (let i = 0; i < strs.length; i++) {
          theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
        }
      }
      this.planeOrShipData = theRequest.planeOrShipData
      // eslint-disable-next-line eqeqeq
    },
    async handleChange(file) {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      console.log('type : ')
      console.log(fileType)
      console.log(file.name)
      this.fileType = fileType
      // eslint-disable-next-line eqeqeq
      if (this.datatype == '1' && fileType != 'txt' && fileType != 'csv') { // 飞机数据，仅 txt和csv格式
        this.$message.warning('文件格式错误')
        return
      }
      // eslint-disable-next-line eqeqeq
      if (this.datatype == '2' && fileType != 'csv') { // 船迹数据，仅csv格式
        this.$message.warning('文件格式错误')
        return
      }
      if (!file) return
      // 当文件类型是xlsx时，严格内容是否正确
      this.dataMsg = '数据处理中，请等待...'
      this.percent = 0
      this.videoUrl = ''
      // 获取文件并转成 ArrayBuffer 对象
      const fileObj = file.raw
      // console.log("file row")
      // console.log(fileObj)
      let buffer
      try {
        buffer = await this.fileToBuffer(fileObj)
      } catch (e) {
        console.log(e)
      }

      // 将文件按固定大小（2M）进行切片，注意此处同时声明了多个常量
      const chunkSize = 2097152
      const chunkList = [] // 保存所有切片的数组
      const chunkListLength = Math.ceil(fileObj.size / chunkSize) // 计算总共多个切片
      const suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1] // 文件后缀名

      this.totalCnt = chunkListLength
      this.sentCnt = 0
      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(buffer)
      const hash = spark.end()

      // 生成切片，这里后端要求传递的参数为字节数据块（chunk）和每个数据块的文件名（fileName）
      let curChunk = 0 // 切片时的初始位置
      for (let i = 0; i < chunkListLength; i++) {
        const item = {
          chunk: fileObj.slice(curChunk, curChunk + chunkSize),
          fileName: `${hash}_${i}.${suffix}` // 文件名规则按照 hash_1.g 命名
        }
        curChunk += chunkSize
        chunkList.push(item)
        console.log(item)
      }
      this.chunkList = chunkList // sendRequest 要用到
      this.hash = hash // sendRequest 要用到
      this.dataMsg = '数据处理完毕，导入中...' // 前端数据处理完毕
      this.sendRequest()
    },

    // 发送请求
    sendRequest() {
      const requestList = [] // 请求集合
      this.chunkList.forEach((item, index) => {
        const fn = () => {
          const formData = new FormData()
          formData.append('chunk', item.chunk)
          formData.append('filename', item.fileName)
          // console.log(item.chunk)
          let myurl = 'http://localhost:8080/import/txt' // 飞机数据
          // eslint-disable-next-line eqeqeq
          if (this.fileType == 'csv') {
            myurl = 'http://localhost:8080/import/csv'
          }
          // eslint-disable-next-line eqeqeq
          if (this.datatype == 2) { // 船迹数据
            myurl = 'http://localhost:8080/import/shipcsv'
          }
          return axios({
            contentType: false,
            processData: false,
            url: myurl,
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            /* params: {
                                chunk: item.chunk,
                                //fileName: item.fileName
                            }*/
            data: formData
          }).then(res => {
            console.log(res.data)
            if (res.data.code === '0') { // 成功
              console.log('enter')
              if (this.percentCount === 0) { // 避免上传成功后会删除切片改变 chunkList 的长度影响到 percentCount 的值
                this.percentCount = 100 / this.chunkList.length
              }
              this.sentCnt = this.sentCnt + 1
              this.percent = (this.sentCnt / this.totalCnt) * 100
              if (this.sentCnt >= this.totalCnt) {
                this.percent = 100
              }
              // this.percent += this.percentCount // 改变进度
              this.chunkList.splice(index, 1) // 一旦上传成功就删除这一个 chunk，方便断点续传
              console.log('percent:')
              console.log(this.percent)
            }
          })
        }
        requestList.push(fn)
      })

      let i = 0 // 记录发送的请求个数
      // 文件切片全部发送完毕后，需要请求 '/merge' 接口，把文件的 hash 传递给服务器
      const complete = () => {
        axios({
          url: 'http://localhost:8080/import/merge',
          method: 'get',
          params: { hash: this.hash }
        }).then(res => {
          if (res.data.code === '0') { // 请求发送成功
            this.videoUrl = res.data.path
            this.dataMsg = '数据导入完成'
            this.percent = 100
          }
        })
      }
      const send = async() => {
        if (!this.upload) return
        if (i >= requestList.length) {
          // 发送完毕
          complete()
          return
        }
        await requestList[i]()
        i++
        send()
      }
      send() // 发送请求
    },

    // 按下暂停按钮
    handleClickBtn() {
      this.upload = !this.upload
      // 如果不暂停则继续上传
      if (this.upload) this.sendRequest()
    },

    // 将 File 对象转为 ArrayBuffer
    fileToBuffer(file) {
      return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onload = e => {
          resolve(e.target.result)
        }
        fr.readAsArrayBuffer(file)
        fr.onerror = () => {
          reject(new Error('转换文件格式发生错误'))
        }
      })
    }
  }
}
</script>

<style scoped>
  .progress-box {
    box-sizing: border-box;
    width: 360px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    padding: 8px 10px;
    background-color: #ecf5ff;
    font-size: 14px;
    border-radius: 4px;
  }
</style>

