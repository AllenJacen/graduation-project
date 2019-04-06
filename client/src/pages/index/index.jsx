import Taro, { Component } from '@tarojs/taro'
import { View, Text ,Input } from '@tarojs/components'
import { AtCountdown, AtCalendar } from 'taro-ui'
import { IndexBar } from '@/widgets/IndexBar/index'
import './index.scss'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }
  constructor(props){
    super(props);
    this.state = {
      list: [
        'get up',
        'coding',
        'sleep',
      ],
      inputVal: ''
    }
  }
  //对应 wxapp 的 onLaunch
  //监听程序初始化，初始化完成时触发（全局只触发一次）
  componentWillMount () { }
  //对应 app 的 onLaunch，在 componentWillMount 后执行
  //监听程序初始化，初始化完成时触发（全局只触发一次)
  componentDidMount () { }

  componentWillUnmount () { }

  //对应 onShow
  //程序启动，或从后台进入前台显示时触发
  componentDidShow () { }
  //对应 onHide
  //程序从前台进入后台时触发
  componentDidHide () { }




  render () {
    let { list , inputVal} = this.state;
    return (
      <View>
        <IndexBar />
        {/* <AtCalendar /> */}
        {/* <AtCountdown className="count-down" isShowDay={265} minutes={1} seconds={10}/> */}
      </View>
    )
  }
}

