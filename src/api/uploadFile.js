import request from '@/utils/request'

export function mergeFile(data) {
  return request({
    url: '/aip/import/mergeFile',
    method: 'post',
    data: data
  })
}
