import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ApiClient from '../ApiClient'
import * as sdk from 'botpress/sdk'

let apiClient: ApiClient

var bp: typeof sdk
console.log('api', ApiClient)
function GetCount() {
  const [count, setCount] = useState('')
  const [countdata, setdata] = useState('')

  useEffect(() => {
    countDataById(24)
    //countData()
  }, [])

  // function getForModule(url: string, config?: AxiosRequestConfig) {
  //   return this.get(MODULE_URL_PREFIX + url, config)
  // }

  function getCountById(id: number) {
    return axios.get(`/api/v1/bots/greet-bot/mod/complete-module/count/${id}`)
  }

  // function getCount() {
  //   return this.getForModule('/rawMessages')
  // }

  function countDataById(id: any) {
    console.log('calling count by id ', id)
    //bp.logger.info('calling countid', id)

    getCountById(id)
      .then(res => {
        console.log('resp', res)
        let countid = res
        //bp.logger.info(countid)
        console.log('countDataById: ', countid)
        //setCount(res)
      })
      .catch(err => bp.logger.info('error :', err))
  }

  function countData() {
    apiClient
      .getCount()
      .then(res => {
        let counts = res
        bp.logger.info(counts)
        console.log('countData: ', counts)
        setdata(counts)
      })
      .catch(err => bp.logger.info('error :', err))
  }

  return (
    <div>
      <button onClick={() => countDataById(24)} type="button" name="countid">
        count id
      </button>
      <br />
      <button type="button" name="countdata">
        count data
      </button>
    </div>
  )
}

export default GetCount