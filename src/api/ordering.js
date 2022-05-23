import request from '@/utils/request'

export function trackToExcell(callback) { // 对应ShipTrackStore的.xlsx数据导出
  return request({
    url: '/api/track/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function trackToCsv(callback) { // 对应ShipTrackStore的.xlsx数据导出
  return request({
    url: '/api/track/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function centralTrackToExcell(callback) { // 对应CentralTrack的.xlsx数据导出
  return request({
    url: '/api/centraltrack/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function centralTrackToCsv(callback) { // 对应CentralTrack的.csv数据导出
  return request({
    url: '/api/centraltrack/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function matchTrackToExcell(callback) { // 对应MatchTrack的.xlsx数据导出
  return request({
    url: '/api/matchtrack/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function matchTrackToCsv(callback) { // 对应matchTrack的.csv数据导出
  return request({
    url: '/api/matchtrack/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function shipCentralTrackToExcell(callback) { // 对应shipCentralTrack的.xlsx数据导出
  return request({
    url: '/api/shipcentraltrack/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function shipCentralTrackToCsv(callback) { // 对应shipCentralTrack的.csv数据导出
  return request({
    url: '/api/shipcentraltrack/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function shipTrackToExcell(callback) { // 对应shiptrackk的.xlsx数据导出
  return request({
    url: '/api/shiptrack/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function shipTrackToCsv(callback) { // 对应shiptrack的.csv数据导出
  return request({
    url: '/api/shiptrack/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}

export function clusterToExcell(callback) { // 对应clusterProperty的.xlsx数据导出
  return request({
    url: '/api/clusterproperty/export', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}// clusterToCsv

export function clusterToCsv(callback) { // 对应shiptrack的.csv数据导出
  return request({
    url: '/api/clusterproperty/exportCsv', // 完整路由地址
    method: 'post', // 请求类型
    procgress: true,
    back: callback,
    responseType: 'blob' // 响应类型，避免乱码
  })
}
